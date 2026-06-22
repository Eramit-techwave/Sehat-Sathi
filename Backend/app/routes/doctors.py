from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas import DoctorProfile, DoctorAvailability
from datetime import datetime

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/me")
async def get_my_doctor_profile(current_user: dict = Depends(verify_token)):
    """Get doctor's own extended profile"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Access restricted to Doctor role")

    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.pop("password", None)
    user["id"] = str(user["_id"])
    user.pop("_id", None)

    doctor_profile = await db["doctors"].find_one({"user_id": user_id})
    if doctor_profile:
        user["specialty"] = doctor_profile.get("specialty", "General")
        user["qualifications"] = doctor_profile.get("qualifications", "")
        user["experience_years"] = doctor_profile.get("experience_years", 0)
        user["bio"] = doctor_profile.get("bio", "")
        user["availability"] = doctor_profile.get("availability", {})
        user["hospital_id"] = doctor_profile.get("hospital_id")

    return user


@router.put("/profile")
async def update_doctor_profile(profile_data: DoctorProfile, current_user: dict = Depends(verify_token)):
    """Doctor updates their professional profile"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Access restricted to Doctor role")

    update_dict = {k: v for k, v in profile_data.model_dump().items() if v is not None}

    if not update_dict:
        return {"success": True, "message": "No changes to update"}

    result = await db["doctors"].update_one(
        {"user_id": user_id},
        {"$set": update_dict},
        upsert=True
    )

    return {"success": True, "message": "Doctor profile updated successfully"}


@router.get("/availability")
async def get_my_availability(current_user: dict = Depends(verify_token)):
    """Get doctor's configured weekly availability"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Access restricted to Doctor role")

    doctor_profile = await db["doctors"].find_one({"user_id": user_id})
    if not doctor_profile:
        return {"availability": {}}

    return {"availability": doctor_profile.get("availability", {})}


@router.put("/availability")
async def update_availability(availability_data: DoctorAvailability, current_user: dict = Depends(verify_token)):
    """Doctor configures their weekly availability"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Access restricted to Doctor role")

    result = await db["doctors"].update_one(
        {"user_id": user_id},
        {"$set": {"availability": availability_data.availability}},
        upsert=True
    )

    return {"success": True, "message": "Availability updated successfully", "availability": availability_data.availability}


@router.get("/{doctor_id}/patients")
async def get_doctor_patients(doctor_id: str, current_user: dict = Depends(verify_token)):
    """Get list of patients who have appointments with this doctor"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    # Only the doctor themselves or admin can view patient list
    if role == "Doctor" and user_id != doctor_id:
        raise HTTPException(status_code=403, detail="You can only view your own patient list")
    elif role not in ["Doctor", "Admin"]:
        raise HTTPException(status_code=403, detail="Access restricted to Doctor or Admin role")

    # Get all appointments for this doctor
    cursor = db["appointments"].find({"doctor_id": doctor_id})
    appointments = await cursor.to_list(length=500)

    # Unique patient IDs
    patient_ids = list(set(apt["patient_id"] for apt in appointments))

    patients = []
    for pid in patient_ids:
        try:
            patient = await db["users"].find_one({"_id": ObjectId(pid)})
            if patient:
                patient.pop("password", None)
                patient["id"] = str(patient["_id"])
                patient.pop("_id", None)

                # Get appointment history with this doctor
                pat_apts = [a for a in appointments if a["patient_id"] == pid]
                patient["appointment_count"] = len(pat_apts)
                patient["last_visit"] = max(a["date"] for a in pat_apts) if pat_apts else None
                patients.append(patient)
        except Exception:
            pass

    return patients


@router.get("/{doctor_id}/stats")
async def get_doctor_stats(doctor_id: str, current_user: dict = Depends(verify_token)):
    """Get statistics for the doctor's dashboard"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role == "Doctor" and user_id != doctor_id:
        raise HTTPException(status_code=403, detail="Access restricted")

    today = datetime.now().strftime("%Y-%m-%d")

    all_apts = await db["appointments"].find({"doctor_id": doctor_id}).to_list(length=1000)
    pending = [a for a in all_apts if a.get("status") == "Pending"]
    today_apts = [a for a in all_apts if a.get("date") == today and a.get("status") != "Cancelled"]
    upcoming = [a for a in all_apts if a.get("date") >= today and a.get("status") not in ["Cancelled", "Completed"]]
    patient_ids = list(set(a["patient_id"] for a in all_apts))

    return {
        "total_patients": len(patient_ids),
        "pending_count": len(pending),
        "today_count": len(today_apts),
        "upcoming_count": len(upcoming),
        "total_appointments": len(all_apts)
    }
