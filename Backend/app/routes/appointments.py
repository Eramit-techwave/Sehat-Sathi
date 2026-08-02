from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas import AppointmentCreate, AppointmentReschedule, AppointmentStatusUpdate
import pymongo
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# Internal notification helper — avoids circular import
async def _notify(db, user_id: str, notif_type: str, title: str, message: str, metadata: dict = None):
    """Create a notification for a user. Fire-and-forget; errors are silenced."""
    try:
        await db["notifications"].insert_one({
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "message": message,
            "is_read": False,
            "metadata": metadata or {},
            "created_at": datetime.now()
        })
    except Exception:
        pass  # Notifications must never break core appointment flow


DEFAULT_TIME_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM"
]

@router.post("/book")
async def book_appointment(appointment: AppointmentCreate, current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    # Validate doctor exists
    try:
        doc_exists = await db["users"].find_one({"_id": ObjectId(appointment.doctor_id), "role": "Doctor"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor ID format")

    if not doc_exists:
        raise HTTPException(status_code=400, detail="Invalid doctor ID — doctor not found")

    # Check for existing active booking on same slot (server-side conflict detection)
    existing = await db["appointments"].find_one({
        "doctor_id": appointment.doctor_id,
        "date": appointment.date,
        "time_slot": appointment.time_slot,
        "status": {"$ne": "Cancelled"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="This time slot is already booked. Please choose another slot.")

    # Process payment status
    payment_method = appointment.payment_method or "cash"
    payment_status = appointment.payment_status or ("Paid" if payment_method in ["upi", "card", "netbanking"] else "Cash at Clinic")
    txn_id = appointment.transaction_id or f"TXN-{int(datetime.now().timestamp() * 1000)}"

    new_apt = {
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
        "created_at": datetime.now()
    }

    try:
        result = await db["appointments"].insert_one(new_apt)
        apt_id = str(result.inserted_id)

        # Fetch names for notification messages
        patient = await db["users"].find_one({"_id": ObjectId(user_id)})
        doctor = await db["users"].find_one({"_id": ObjectId(appointment.doctor_id)})
        patient_name = patient.get("name", "Patient") if patient else "Patient"
        doctor_name = doctor.get("name", "Doctor") if doctor else "Doctor"

        # Notify patient
        await _notify(db, user_id, "appointment_booked",
            "Appointment Booked Successfully 🎉",
            f"Your appointment with Dr. {doctor_name} on {appointment.date} at {appointment.time_slot} is booked ({payment_status}).",
            {"appointment_id": apt_id, "date": appointment.date, "time_slot": appointment.time_slot, "transaction_id": txn_id}
        )
        # Notify doctor
        await _notify(db, appointment.doctor_id, "appointment_booked",
            "New Appointment Booking 📅",
            f"{patient_name} booked an appointment for {appointment.date} at {appointment.time_slot} ({payment_status}).",
            {"appointment_id": apt_id, "date": appointment.date, "patient_id": user_id}
        )

        return {
            "success": True, 
            "message": "Appointment booked successfully", 
            "appointment_id": apt_id,
            "transaction_id": txn_id,
            "payment_status": payment_status
        }
    except pymongo.errors.DuplicateKeyError:
        raise HTTPException(status_code=400, detail="This time slot was just taken. Please choose another slot.")


@router.get("/my")
async def get_my_appointments(current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role", "Patient")

    query = {}
    if role == "Patient":
        query = {"patient_id": user_id}
    elif role == "Doctor":
        query = {"doctor_id": user_id}
    elif role == "Hospital":
        query = {"hospital_id": user_id}

    cursor = db["appointments"].find(query).sort("date", -1)
    appointments = await cursor.to_list(length=200)

    for apt in appointments:
        apt["id"] = str(apt["_id"])
        apt.pop("_id", None)
        # Fetch doctor and patient names
        try:
            doc = await db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
            pat = await db["users"].find_one({"_id": ObjectId(apt["patient_id"])})
            if doc:
                apt["doctor_name"] = doc.get("name")
            if pat:
                apt["patient_name"] = pat.get("name")
        except Exception:
            pass
        # Serialize datetime
        if isinstance(apt.get("created_at"), datetime):
            apt["created_at"] = apt["created_at"].isoformat()

    return appointments


@router.get("/history")
async def get_appointment_history(current_user: dict = Depends(verify_token)):
    """Full history including cancelled and completed appointments"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role", "Patient")

    query = {}
    if role == "Patient":
        query = {"patient_id": user_id}
    elif role == "Doctor":
        query = {"doctor_id": user_id}
    elif role == "Hospital":
        query = {"hospital_id": user_id}

    cursor = db["appointments"].find(query).sort("date", -1)
    appointments = await cursor.to_list(length=500)

    for apt in appointments:
        apt["id"] = str(apt["_id"])
        apt.pop("_id", None)
        try:
            doc = await db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
            pat = await db["users"].find_one({"_id": ObjectId(apt["patient_id"])})
            if doc: apt["doctor_name"] = doc.get("name")
            if pat: apt["patient_name"] = pat.get("name")
        except Exception:
            pass
        if isinstance(apt.get("created_at"), datetime):
            apt["created_at"] = apt["created_at"].isoformat()

    return appointments


@router.delete("/{appointment_id}")
async def cancel_appointment(appointment_id: str, current_user: dict = Depends(verify_token)):
    """Cancel an appointment — slot is released back to availability"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role", "Patient")

    try:
        apt = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID")

    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Authorization check — only the patient who booked, or the doctor, or admin can cancel
    if role == "Patient" and apt["patient_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own appointments")
    elif role == "Doctor" and apt["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only cancel your own appointments")

    if apt.get("status") == "Cancelled":
        raise HTTPException(status_code=400, detail="Appointment is already cancelled")

    result = await db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "Cancelled", "cancelled_at": datetime.now()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Notify both parties about cancellation
    canceller = await db["users"].find_one({"_id": ObjectId(user_id)})
    canceller_name = canceller.get("name", "Someone") if canceller else "Someone"
    cancel_msg = f"Appointment on {apt.get('date')} at {apt.get('time_slot')} has been cancelled by {canceller_name}."

    # Notify the other party
    other_id = apt.get("patient_id") if role == "Doctor" else apt.get("doctor_id")
    if other_id and other_id != user_id:
        await _notify(db, other_id, "appointment_cancelled",
            "Appointment Cancelled ❌", cancel_msg,
            {"appointment_id": appointment_id, "date": apt.get("date")}
        )

    return {"success": True, "message": "Appointment cancelled successfully. The slot is now available."}


@router.put("/{appointment_id}/reschedule")
async def reschedule_appointment(
    appointment_id: str,
    new_booking: AppointmentReschedule,
    current_user: dict = Depends(verify_token)
):
    """Reschedule: cancel current slot and create new booking atomically"""
    db = get_db()
    user_id = current_user.get("sub")

    try:
        apt = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID")

    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if apt["patient_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only reschedule your own appointments")

    if apt.get("status") == "Cancelled":
        raise HTTPException(status_code=400, detail="Cannot reschedule a cancelled appointment")

    # Check new slot availability (server-side)
    existing = await db["appointments"].find_one({
        "doctor_id": apt["doctor_id"],
        "date": new_booking.new_date,
        "time_slot": new_booking.new_time_slot,
        "status": {"$ne": "Cancelled"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="The new time slot is already booked. Please choose another slot.")

    # Cancel the current appointment
    await db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "Cancelled", "cancelled_at": datetime.now()}}
    )

    # Create new appointment
    new_apt = {
        "patient_id": user_id,
        "doctor_id": apt["doctor_id"],
        "hospital_id": apt.get("hospital_id"),
        "date": new_booking.new_date,
        "time_slot": new_booking.new_time_slot,
        "status": "Pending",
        "rescheduled_from": appointment_id,
        "created_at": datetime.now()
    }

    try:
        result = await db["appointments"].insert_one(new_apt)
        return {
            "success": True,
            "message": f"Appointment rescheduled to {new_booking.new_date} at {new_booking.new_time_slot}",
            "new_appointment_id": str(result.inserted_id)
        }
    except pymongo.errors.DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Slot conflict detected. Please choose another slot.")


@router.get("/doctor/{doctor_id}/slots")
async def get_doctor_slots(doctor_id: str, date: str):
    db = get_db()

    # Get doctor's configured availability
    doctor_profile = await db["doctors"].find_one({"user_id": doctor_id})
    availability = doctor_profile.get("availability", {}) if doctor_profile else {}

    # Determine day of week from date
    try:
        day_of_week = datetime.strptime(date, "%Y-%m-%d").strftime("%A")
        configured_slots = availability.get(day_of_week, ALL_SLOTS)
    except ValueError:
        configured_slots = ALL_SLOTS

    # Remove already-booked slots (exclude cancelled)
    cursor = db["appointments"].find({
        "doctor_id": doctor_id,
        "date": date,
        "status": {"$ne": "Cancelled"}
    })
    booked_appointments = await cursor.to_list(length=100)
    booked_slots = [apt["time_slot"] for apt in booked_appointments]

    available_slots = [s for s in configured_slots if s not in booked_slots]
    return {"date": date, "available_slots": available_slots, "booked_slots": booked_slots}


@router.get("/doctors")
async def list_doctors():
    """Public doctor listing — only returns verified/approved doctors with hospital info."""
    db = get_db()
    approved_profiles = await db["doctors"].find({"verification_status": "approved"}).to_list(length=100)
    doctors = []
    for doc_details in approved_profiles:
        user = await db["users"].find_one({"_id": ObjectId(doc_details["user_id"])})
        if user:
            user.pop("password", None)

            # Resolve hospital associations with names
            raw_associations = doc_details.get("hospital_associations", [])
            resolved_associations = []
            for assoc in raw_associations:
                hosp_id = assoc.get("hospital_id")
                if hosp_id:
                    hosp_name = assoc.get("hospital_name", "")
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
                        "is_primary": assoc.get("is_primary", False)
                    })

            doc = {
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
                "consultation_fee": doc_details.get("consultation_fee")
            }
            doctors.append(doc)
    return doctors


@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: Optional[str] = None,
    payload: Optional[AppointmentStatusUpdate] = None,
    current_user: dict = Depends(verify_token)
):
    db = get_db()
    role = current_user.get("role")
    if role not in ["Doctor", "Hospital", "Admin", "Patient"]:
        raise HTTPException(status_code=403, detail="Unauthorized to change appointment status")

    target_status = (payload.status if payload else status) or "Pending"
    allowed_statuses = ["Pending", "Confirmed", "Rescheduled", "Cancelled", "Completed"]
    if target_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {', '.join(allowed_statuses)}")

    try:
        apt = await db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID")

    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_doc = {
        "status": target_status,
        "status_updated_at": datetime.now()
    }
    if payload and payload.new_date:
        update_doc["date"] = payload.new_date
    if payload and payload.new_time_slot:
        update_doc["time_slot"] = payload.new_time_slot
    if payload and payload.doctor_note:
        update_doc["doctor_note"] = payload.doctor_note

    await db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": update_doc}
    )

    doc = await db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
    doctor_name = doc.get("name", "Doctor") if doc else "Doctor"
    assigned_date = update_doc.get("date", apt.get("date"))
    assigned_slot = update_doc.get("time_slot", apt.get("time_slot"))

    if target_status == "Confirmed":
        await _notify(db, apt["patient_id"], "appointment_confirmed",
            "Appointment Confirmed ⏰",
            f"Dr. {doctor_name} confirmed your appointment for {assigned_date} at {assigned_slot}.",
            {"appointment_id": appointment_id, "date": assigned_date, "time_slot": assigned_slot}
        )
    elif target_status in ["Rescheduled", "Reschedule"]:
        await _notify(db, apt["patient_id"], "appointment_rescheduled",
            "Time Slot Updated 📅",
            f"Dr. {doctor_name} updated your appointment slot to {assigned_date} at {assigned_slot}.",
            {"appointment_id": appointment_id, "date": assigned_date, "time_slot": assigned_slot}
        )
    elif target_status == "Cancelled":
        await _notify(db, apt["patient_id"], "appointment_cancelled",
            "Appointment Cancelled ❌",
            f"Your appointment with Dr. {doctor_name} on {assigned_date} at {assigned_slot} was cancelled.",
            {"appointment_id": appointment_id, "date": assigned_date}
        )
    elif target_status == "Completed":
        await _notify(db, apt["patient_id"], "appointment_completed",
            "Consultation Completed 🎉",
            f"Your consultation with Dr. {doctor_name} has been completed.",
            {"appointment_id": appointment_id}
        )

    return {
        "success": True,
        "message": f"Appointment status updated to {target_status}",
        "appointment_id": appointment_id,
        "date": assigned_date,
        "time_slot": assigned_slot
    }
