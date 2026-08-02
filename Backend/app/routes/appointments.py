from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas import AppointmentCreate, AppointmentReschedule, AppointmentStatusUpdate
import pymongo
from datetime import datetime
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# ── All time slots constant (was undefined — caused NameError in get_doctor_slots) ──
ALL_SLOTS: List[str] = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
]

DEFAULT_TIME_SLOTS: List[str] = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM",
]

# ── Internal notification helper — avoids circular import ──
async def _notify(
    db: Any,
    user_id: str,
    notif_type: str,
    title: str,
    message: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """Create a notification for a user. Fire-and-forget; errors are silenced."""
    try:
        await db["notifications"].insert_one({
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "message": message,
            "is_read": False,
            "metadata": metadata or {},
            "created_at": datetime.now(),
        })
    except Exception:
        pass  # Notifications must never break core appointment flow


# ── Safe ObjectId helper ──
def _to_object_id(id_str: str, label: str = "ID") -> ObjectId:
    """Convert string to ObjectId; raise 400 on failure."""
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {label} format: '{id_str}'")


@router.post("/book")
async def book_appointment(
    appointment: AppointmentCreate,
    current_user: dict = Depends(verify_token),
):
    db = get_db()
    user_id: str = current_user.get("sub")

    # Validate doctor exists
    doctor_oid = _to_object_id(appointment.doctor_id, "doctor ID")
    doc_exists = await db["users"].find_one({"_id": doctor_oid, "role": "Doctor"})
    if not doc_exists:
        raise HTTPException(status_code=400, detail="Invalid doctor ID — doctor not found")

    # Server-side conflict detection (race-condition-safe due to unique index recommended on collection)
    existing = await db["appointments"].find_one({
        "doctor_id": appointment.doctor_id,
        "date": appointment.date,
        "time_slot": appointment.time_slot,
        "status": {"$ne": "Cancelled"},
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This time slot is already booked. Please choose another slot.",
        )

    # Process payment status
    payment_method: str = appointment.payment_method or "cash"
    payment_status: str = appointment.payment_status or (
        "Paid" if payment_method in ("upi", "card", "netbanking") else "Cash at Clinic"
    )
    txn_id: str = appointment.transaction_id or f"TXN-{int(datetime.now().timestamp() * 1000)}"

    new_apt: Dict[str, Any] = {
        "patient_id": user_id,
        "doctor_id": appointment.doctor_id,
        "hospital_id": appointment.hospital_id,
        "date": appointment.date,
        "time_slot": appointment.time_slot,
        "status": "Confirmed" if payment_status == "Paid" else "Pending",
        "reason": appointment.reason,
        "payment_method": payment_method,
        "payment_status": payment_status,
        "amount": appointment.amount or 0.0,
        "transaction_id": txn_id,
        "created_at": datetime.now(),
    }

    try:
        result = await db["appointments"].insert_one(new_apt)
        apt_id = str(result.inserted_id)

        # Fetch names for notification messages
        patient = await db["users"].find_one({"_id": ObjectId(user_id)})
        doctor = await db["users"].find_one({"_id": doctor_oid})
        patient_name: str = patient.get("name", "Patient") if patient else "Patient"
        doctor_name: str = doctor.get("name", "Doctor") if doctor else "Doctor"

        # Notify patient
        await _notify(
            db, user_id, "appointment_booked",
            "Appointment Booked Successfully 🎉",
            (
                f"Your appointment with Dr. {doctor_name} on {appointment.date} "
                f"at {appointment.time_slot} is booked ({payment_status})."
            ),
            {
                "appointment_id": apt_id,
                "date": appointment.date,
                "time_slot": appointment.time_slot,
                "transaction_id": txn_id,
            },
        )
        # Notify doctor
        await _notify(
            db, appointment.doctor_id, "appointment_booked",
            "New Appointment Booking 📅",
            (
                f"{patient_name} booked an appointment for {appointment.date} "
                f"at {appointment.time_slot} ({payment_status})."
            ),
            {
                "appointment_id": apt_id,
                "date": appointment.date,
                "patient_id": user_id,
            },
        )

        return {
            "success": True,
            "message": "Appointment booked successfully",
            "appointment_id": apt_id,
            "transaction_id": txn_id,
            "payment_status": payment_status,
        }

    except pymongo.errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="This time slot was just taken. Please choose another slot.",
        )


@router.get("/my")
async def get_my_appointments(current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id: str = current_user.get("sub")
    role: str = current_user.get("role", "Patient")

    if role == "Patient":
        query: Dict[str, Any] = {"patient_id": user_id}
    elif role == "Doctor":
        query = {"doctor_id": user_id}
    elif role == "Hospital":
        query = {"hospital_id": user_id}
    else:
        query = {"patient_id": user_id}  # Safe fallback

    cursor = db["appointments"].find(query).sort("date", -1)
    appointments: List[Dict[str, Any]] = await cursor.to_list(length=200)

    for apt in appointments:
        apt["id"] = str(apt["_id"])
        apt.pop("_id", None)

        # Fetch doctor and patient names safely
        try:
            doc = await db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
            pat = await db["users"].find_one({"_id": ObjectId(apt["patient_id"])})
            if doc:
                apt["doctor_name"] = doc.get("name")
            if pat:
                apt["patient_name"] = pat.get("name")
        except Exception:
            pass

        # Serialize datetime objects
        if isinstance(apt.get("created_at"), datetime):
            apt["created_at"] = apt["created_at"].isoformat()
        if isinstance(apt.get("cancelled_at"), datetime):
            apt["cancelled_at"] = apt["cancelled_at"].isoformat()
        if isinstance(apt.get("status_updated_at"), datetime):
            apt["status_updated_at"] = apt["status_updated_at"].isoformat()

    return appointments


@router.get("/history")
async def get_appointment_history(current_user: dict = Depends(verify_token)):
    """Full history including cancelled and completed appointments."""
    db = get_db()
    user_id: str = current_user.get("sub")
    role: str = current_user.get("role", "Patient")

    if role == "Patient":
        query: Dict[str, Any] = {"patient_id": user_id}
    elif role == "Doctor":
        query = {"doctor_id": user_id}
    elif role == "Hospital":
        query = {"hospital_id": user_id}
    else:
        query = {"patient_id": user_id}

    cursor = db["appointments"].find(query).sort("date", -1)
    appointments: List[Dict[str, Any]] = await cursor.to_list(length=500)

    for apt in appointments:
        apt["id"] = str(apt["_id"])
        apt.pop("_id", None)

        try:
            doc = await db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
            pat = await db["users"].find_one({"_id": ObjectId(apt["patient_id"])})
            if doc:
                apt["doctor_name"] = doc.get("name")
            if pat:
                apt["patient_name"] = pat.get("name")
        except Exception:
            pass

        # Serialize all datetime fields
        for dt_field in ("created_at", "cancelled_at", "status_updated_at"):
            if isinstance(apt.get(dt_field), datetime):
                apt[dt_field] = apt[dt_field].isoformat()

    return appointments


@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    current_user: dict = Depends(verify_token),
):
    """Cancel an appointment — slot is released back to availability."""
    db = get_db()
    user_id: str = current_user.get("sub")
    role: str = current_user.get("role", "Patient")

    apt_oid = _to_object_id(appointment_id, "appointment ID")
    apt = await db["appointments"].find_one({"_id": apt_oid})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Authorization check
    if role == "Patient" and apt.get("patient_id") != user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own appointments")
    elif role == "Doctor" and apt.get("doctor_id") != user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own appointments")

    if apt.get("status") == "Cancelled":
        raise HTTPException(status_code=400, detail="Appointment is already cancelled")

    result = await db["appointments"].update_one(
        {"_id": apt_oid},
        {"$set": {"status": "Cancelled", "cancelled_at": datetime.now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Notify the other party about cancellation
    canceller = await db["users"].find_one({"_id": ObjectId(user_id)})
    canceller_name: str = canceller.get("name", "Someone") if canceller else "Someone"
    cancel_msg = (
        f"Appointment on {apt.get('date')} at {apt.get('time_slot')} "
        f"has been cancelled by {canceller_name}."
    )

    other_id: Optional[str] = apt.get("patient_id") if role == "Doctor" else apt.get("doctor_id")
    if other_id and other_id != user_id:
        await _notify(
            db, other_id, "appointment_cancelled",
            "Appointment Cancelled ❌",
            cancel_msg,
            {"appointment_id": appointment_id, "date": apt.get("date")},
        )

    return {
        "success": True,
        "message": "Appointment cancelled successfully. The slot is now available.",
    }


@router.put("/{appointment_id}/reschedule")
async def reschedule_appointment(
    appointment_id: str,
    new_booking: AppointmentReschedule,
    current_user: dict = Depends(verify_token),
):
    """Reschedule: cancel current slot and create new booking atomically."""
    db = get_db()
    user_id: str = current_user.get("sub")

    apt_oid = _to_object_id(appointment_id, "appointment ID")
    apt = await db["appointments"].find_one({"_id": apt_oid})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if apt.get("patient_id") != user_id:
        raise HTTPException(status_code=403, detail="You can only reschedule your own appointments")

    if apt.get("status") == "Cancelled":
        raise HTTPException(status_code=400, detail="Cannot reschedule a cancelled appointment")

    # Check new slot availability (server-side)
    existing = await db["appointments"].find_one({
        "doctor_id": apt["doctor_id"],
        "date": new_booking.new_date,
        "time_slot": new_booking.new_time_slot,
        "status": {"$ne": "Cancelled"},
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail="The new time slot is already booked. Please choose another slot.",
        )

    # Cancel current appointment
    await db["appointments"].update_one(
        {"_id": apt_oid},
        {"$set": {"status": "Cancelled", "cancelled_at": datetime.now()}},
    )

    # Create new appointment
    new_apt: Dict[str, Any] = {
        "patient_id": user_id,
        "doctor_id": apt["doctor_id"],
        "hospital_id": apt.get("hospital_id"),
        "date": new_booking.new_date,
        "time_slot": new_booking.new_time_slot,
        "status": "Pending",
        "reason": apt.get("reason"),
        "rescheduled_from": appointment_id,
        "created_at": datetime.now(),
    }

    try:
        result = await db["appointments"].insert_one(new_apt)
        return {
            "success": True,
            "message": (
                f"Appointment rescheduled to {new_booking.new_date} "
                f"at {new_booking.new_time_slot}"
            ),
            "new_appointment_id": str(result.inserted_id),
        }
    except pymongo.errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400,
            detail="Slot conflict detected. Please choose another slot.",
        )


@router.get("/doctor/{doctor_id}/slots")
async def get_doctor_slots(doctor_id: str, date: str):
    """Return available and booked slots for a doctor on a given date."""
    db = get_db()

    # Fetch doctor's configured availability
    doctor_profile = await db["doctors"].find_one({"user_id": doctor_id})
    availability: Dict[str, List[str]] = (
        doctor_profile.get("availability", {}) if doctor_profile else {}
    )

    # Determine day of week from date string
    try:
        day_of_week: str = datetime.strptime(date, "%Y-%m-%d").strftime("%A")
        configured_slots: List[str] = availability.get(day_of_week, ALL_SLOTS)
    except ValueError:
        configured_slots = ALL_SLOTS

    # Remove already-booked slots (exclude cancelled)
    cursor = db["appointments"].find({
        "doctor_id": doctor_id,
        "date": date,
        "status": {"$ne": "Cancelled"},
    })
    booked_appointments: List[Dict[str, Any]] = await cursor.to_list(length=100)
    booked_slots: List[str] = [apt["time_slot"] for apt in booked_appointments]

    available_slots: List[str] = [s for s in configured_slots if s not in booked_slots]

    return {
        "date": date,
        "available_slots": available_slots,
        "booked_slots": booked_slots,
    }


@router.get("/doctors")
async def list_doctors():
    """Public doctor listing — only returns verified/approved doctors with hospital info."""
    db = get_db()
    approved_profiles: List[Dict[str, Any]] = await db["doctors"].find(
        {"verification_status": "approved"}
    ).to_list(length=100)

    doctors: List[Dict[str, Any]] = []

    for doc_details in approved_profiles:
        user_oid = _to_object_id(doc_details["user_id"], "user ID") if doc_details.get("user_id") else None
        if not user_oid:
            continue

        user = await db["users"].find_one({"_id": user_oid})
        if not user:
            continue

        user.pop("password", None)

        # Resolve hospital associations with names
        raw_associations: List[Dict[str, Any]] = doc_details.get("hospital_associations", [])
        resolved_associations: List[Dict[str, Any]] = []

        for assoc in raw_associations:
            hosp_id: Optional[str] = assoc.get("hospital_id")
            if not hosp_id:
                continue

            hosp_name: str = assoc.get("hospital_name", "")
            try:
                hosp_user = await db["users"].find_one({"_id": ObjectId(hosp_id)})
                if hosp_user:
                    hosp_name = hosp_user.get("name", hosp_name)
            except Exception:
                pass

            resolved_associations.append({
                "hospital_id": hosp_id,
                "hospital_name": hosp_name,
                "role": assoc.get("role", "Consultant"),
                "is_primary": assoc.get("is_primary", False),
            })

        doc: Dict[str, Any] = {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "specialty": doc_details.get("specialty", "General"),
            "qualifications": doc_details.get("qualifications", ""),
            "experience_years": doc_details.get("experience_years", 0),
            "bio": doc_details.get("bio", ""),
            "availability": doc_details.get("availability", {}),
            "hospital_id": doc_details.get("hospital_id"),
            "hospital_associations": resolved_associations,
            "practice_type": doc_details.get("practice_type", "independent"),
            "consultation_fee": doc_details.get("consultation_fee"),
        }
        doctors.append(doc)

    return doctors


@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: Optional[str] = None,
    payload: Optional[AppointmentStatusUpdate] = None,
    current_user: dict = Depends(verify_token),
):
    db = get_db()
    role: str = current_user.get("role", "")

    if role not in ("Doctor", "Hospital", "Admin", "Patient"):
        raise HTTPException(status_code=403, detail="Unauthorized to change appointment status")

    # Resolve target status from payload or query param
    target_status: str = (
        (payload.status if payload and payload.status else None)
        or status
        or "Pending"
    )

    allowed_statuses = ("Pending", "Confirmed", "Rescheduled", "Cancelled", "Completed")
    if target_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(allowed_statuses)}",
        )

    apt_oid = _to_object_id(appointment_id, "appointment ID")
    apt = await db["appointments"].find_one({"_id": apt_oid})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_doc: Dict[str, Any] = {
        "status": target_status,
        "status_updated_at": datetime.now(),
    }
    if payload and payload.new_date:
        update_doc["date"] = payload.new_date
    if payload and payload.new_time_slot:
        update_doc["time_slot"] = payload.new_time_slot
    if payload and payload.doctor_note:
        update_doc["doctor_note"] = payload.doctor_note

    await db["appointments"].update_one(
        {"_id": apt_oid},
        {"$set": update_doc},
    )

    # Fetch doctor name for notifications
    try:
        doc = await db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
        doctor_name: str = doc.get("name", "Doctor") if doc else "Doctor"
    except Exception:
        doctor_name = "Doctor"

    assigned_date: str = update_doc.get("date", apt.get("date", ""))
    assigned_slot: str = update_doc.get("time_slot", apt.get("time_slot", ""))
    patient_id: str = apt.get("patient_id", "")

    if target_status == "Confirmed":
        await _notify(
            db, patient_id, "appointment_confirmed",
            "Appointment Confirmed ⏰",
            f"Dr. {doctor_name} confirmed your appointment for {assigned_date} at {assigned_slot}.",
            {"appointment_id": appointment_id, "date": assigned_date, "time_slot": assigned_slot},
        )
    elif target_status in ("Rescheduled", "Reschedule"):
        await _notify(
            db, patient_id, "appointment_rescheduled",
            "Time Slot Updated 📅",
            f"Dr. {doctor_name} updated your appointment slot to {assigned_date} at {assigned_slot}.",
            {"appointment_id": appointment_id, "date": assigned_date, "time_slot": assigned_slot},
        )
    elif target_status == "Cancelled":
        await _notify(
            db, patient_id, "appointment_cancelled",
            "Appointment Cancelled ❌",
            f"Your appointment with Dr. {doctor_name} on {assigned_date} at {assigned_slot} was cancelled.",
            {"appointment_id": appointment_id, "date": assigned_date},
        )
    elif target_status == "Completed":
        await _notify(
            db, patient_id, "appointment_completed",
            "Consultation Completed 🎉",
            f"Your consultation with Dr. {doctor_name} has been completed.",
            {"appointment_id": appointment_id},
        )

    return {
        "success": True,
        "message": f"Appointment status updated to {target_status}",
        "appointment_id": appointment_id,
        "date": assigned_date,
        "time_slot": assigned_slot,
    }