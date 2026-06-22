from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas import DoctorProfile, DoctorAvailability
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/me")
async def get_my_doctor_profile(current_user: dict = Depends(verify_token)):
    """Get doctor's own extended profile including hospital associations"""
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
        user["consultation_fee"] = doctor_profile.get("consultation_fee")
        user["practice_type"] = doctor_profile.get("practice_type", "independent")
        user["medical_reg_number"] = doctor_profile.get("medical_reg_number", "")
        user["verification_status"] = doctor_profile.get("verification_status", "pending")

        # Resolve hospital associations with hospital names
        raw_associations = doctor_profile.get("hospital_associations", [])
        resolved = []
        for assoc in raw_associations:
            hosp_id = assoc.get("hospital_id")
            if hosp_id:
                hosp_name = assoc.get("hospital_name", "Unknown Hospital")
                try:
                    hosp_user = await db["users"].find_one({"_id": ObjectId(hosp_id)})
                    if hosp_user:
                        hosp_name = hosp_user.get("name", hosp_name)
                except Exception:
                    pass
                resolved.append({
                    "hospital_id": hosp_id,
                    "hospital_name": hosp_name,
                    "role": assoc.get("role", "Consultant"),
                    "is_primary": assoc.get("is_primary", False)
                })
        user["hospital_associations"] = resolved

    return user


@router.put("/profile")
async def update_doctor_profile(profile_data: DoctorProfile, current_user: dict = Depends(verify_token)):
    """Doctor updates their professional profile"""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Access restricted to Doctor role")

    data = profile_data.model_dump()
    update_dict = {}

    # Handle hospital_associations separately
    raw_assocs = data.pop("hospital_associations", None)
    if raw_assocs is not None:
        assocs = [{k: v for k, v in a.items() if v is not None} for a in raw_assocs if a]
        update_dict["hospital_associations"] = assocs

        # Auto-set practice_type
        if len(assocs) == 0:
            data["practice_type"] = "independent"
            update_dict["hospital_id"] = None
        elif len(assocs) == 1:
            data["practice_type"] = "hospital_based"
            update_dict["hospital_id"] = assocs[0].get("hospital_id")
        else:
            data["practice_type"] = "multi_hospital"
            primary = next((a for a in assocs if a.get("is_primary")), assocs[0])
            update_dict["hospital_id"] = primary.get("hospital_id")

    update_dict.update({k: v for k, v in data.items() if v is not None})

    if not update_dict:
        return {"success": True, "message": "No changes to update"}

    await db["doctors"].update_one(
        {"user_id": user_id},
        {"$set": update_dict},
        upsert=True
    )
    return {"success": True, "message": "Doctor profile updated successfully"}


@router.put("/hospital-associations")
async def update_hospital_associations(
    payload: dict,
    current_user: dict = Depends(verify_token)
):
    """
    Update doctor's hospital affiliations.
    Body: { "associations": [ { "hospital_id": "...", "role": "Consultant", "is_primary": true } ] }
    Pass empty list to mark as independent practitioner.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Access restricted to Doctor role")

    assocs = payload.get("associations", [])

    # Validate each hospital exists and is approved
    for assoc in assocs:
        h_id = assoc.get("hospital_id")
        if h_id:
            hosp = await db["hospitals"].find_one({"user_id": h_id, "verification_status": "approved"})
            if not hosp:
                raise HTTPException(
                    status_code=400,
                    detail=f"Hospital {h_id} is not found or not yet verified."
                )

    # Determine practice type automatically
    if len(assocs) == 0:
        practice_type = "independent"
        hospital_id = None
    elif len(assocs) == 1:
        practice_type = "hospital_based"
        hospital_id = assocs[0].get("hospital_id")
    else:
        practice_type = "multi_hospital"
        primary = next((a for a in assocs if a.get("is_primary")), assocs[0])
        hospital_id = primary.get("hospital_id")

    await db["doctors"].update_one(
        {"user_id": user_id},
        {"$set": {
            "hospital_associations": assocs,
            "practice_type": practice_type,
            "hospital_id": hospital_id,
            "updated_at": datetime.now()
        }},
        upsert=True
    )
    return {
        "success": True,
        "message": f"Hospital affiliations updated. Practice type: {practice_type}",
        "practice_type": practice_type,
        "associations_count": len(assocs)
    }


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

    await db["doctors"].update_one(
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

    if role == "Doctor" and user_id != doctor_id:
        raise HTTPException(status_code=403, detail="You can only view your own patient list")
    elif role not in ["Doctor", "Admin"]:
        raise HTTPException(status_code=403, detail="Access restricted to Doctor or Admin role")

    cursor = db["appointments"].find({"doctor_id": doctor_id})
    appointments = await cursor.to_list(length=500)

    patient_ids = list(set(apt["patient_id"] for apt in appointments))
    patients = []
    for pid in patient_ids:
        try:
            patient = await db["users"].find_one({"_id": ObjectId(pid)})
            if patient:
                patient.pop("password", None)
                patient["id"] = str(patient["_id"])
                patient.pop("_id", None)
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
