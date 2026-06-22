from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas import AppointmentCreate, AppointmentReschedule
import pymongo
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["Appointments"])

ALL_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
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

    new_apt = {
        "patient_id": user_id,
        "doctor_id": appointment.doctor_id,
        "hospital_id": appointment.hospital_id,
        "date": appointment.date,
        "time_slot": appointment.time_slot,
        "status": "Pending",
        "created_at": datetime.now()
    }

    try:
        result = await db["appointments"].insert_one(new_apt)
        return {"success": True, "message": "Appointment booked successfully", "appointment_id": str(result.inserted_id)}
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
    db = get_db()
    cursor = db["users"].find({"role": "Doctor"})
    doctors = await cursor.to_list(length=100)
    for doc in doctors:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        doc.pop("password", None)
        doc_details = await db["doctors"].find_one({"user_id": doc["id"]})
        if doc_details:
            doc["specialty"] = doc_details.get("specialty", "General")
            doc["qualifications"] = doc_details.get("qualifications", "")
            doc["experience_years"] = doc_details.get("experience_years", 0)
            doc["bio"] = doc_details.get("bio", "")
            doc["availability"] = doc_details.get("availability", {})
    return doctors


@router.put("/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str, current_user: dict = Depends(verify_token)):
    db = get_db()
    role = current_user.get("role")
    if role not in ["Doctor", "Hospital", "Admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized to change appointment status")

    allowed_statuses = ["Pending", "Confirmed", "Cancelled", "Completed"]
    if status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {', '.join(allowed_statuses)}")

    result = await db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return {"success": True, "message": f"Appointment status updated to {status}"}
