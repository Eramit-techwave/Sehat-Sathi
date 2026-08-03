from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas import EnhancedDonorRegistration, EnhancedBloodRequest
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/donors", tags=["Blood Donors"])


@router.get("")
async def get_donors(blood_group: Optional[str] = None, city: Optional[str] = None):
    db = get_db()
    query = {"available": True}
    if blood_group and blood_group != "All":
        query["bloodGroup"] = blood_group
    if city:
        query["city"] = {"$regex": city, "$options": "i"}

    cursor = db["donors"].find(query)
    donors = await cursor.to_list(length=200)
    for d in donors:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
    return donors


@router.post("/register")
async def register_donor(donor: EnhancedDonorRegistration, current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    donor_data = {
        "user_id": user_id,
        "name": donor.fullName,
        "phone": donor.phone,
        "bloodGroup": donor.bloodGroup,
        "age": donor.age,
        "gender": donor.gender or "Other",
        "weight": donor.weight,
        "city": donor.city,
        "state": donor.state,
        "address": donor.address,
        "pincode": donor.pincode,
        "lastDonation": donor.lastDonation or "Never",
        # Medical & Screening Details
        "consumes_alcohol": donor.consumes_alcohol,
        "alcohol_frequency": donor.alcohol_frequency,
        "last_alcohol_consumed": donor.last_alcohol_consumed,
        "has_current_illness": donor.has_current_illness,
        "current_illnesses": donor.current_illnesses,
        "taking_medications": donor.taking_medications,
        "medication_details": donor.medication_details,
        "has_past_major_illness": donor.has_past_major_illness,
        "past_medical_history": donor.past_medical_history,
        "recent_surgery_or_vaccination": donor.recent_surgery_or_vaccination,
        "available": True,
        "updated_at": datetime.now()
    }

    # Check if already registered
    existing = await db["donors"].find_one({"user_id": user_id})
    if existing:
        await db["donors"].update_one(
            {"user_id": user_id},
            {"$set": donor_data}
        )
        return {"success": True, "message": "Blood donor medical profile updated successfully!"}

    donor_data["registered_at"] = datetime.now()
    await db["donors"].insert_one(donor_data)
    return {"success": True, "message": "Registered as blood donor with complete medical screening! You may save a life today. 🩸"}


@router.post("/request")
async def request_blood(request: EnhancedBloodRequest, current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    blood_request = {
        "requested_by": user_id,
        "patientName": request.patientName,
        "patientAge": request.patientAge,
        "patientGender": request.patientGender,
        "bloodGroup": request.bloodGroup,
        "unitsRequired": request.unitsRequired or 1,
        "hospital": request.hospital,
        "city": request.city,
        "urgency": request.urgency,
        "requesterName": request.requesterName,
        "requesterPhone": request.requesterPhone,
        "requesterAddress": request.requesterAddress,
        "doctorInCharge": request.doctorInCharge,
        "roomNumber": request.roomNumber,
        "reasonForBlood": request.reasonForBlood,
        "patientMedicalHistory": request.patientMedicalHistory,
        "status": "Open",
        "created_at": datetime.now()
    }
    result = await db["blood_requests"].insert_one(blood_request)
    return {"success": True, "message": "Blood request submitted with detailed clinical requirements! Donors will be notified.", "request_id": str(result.inserted_id)}



@router.get("/requests")
async def get_blood_requests(city: Optional[str] = None):
    db = get_db()
    query = {"status": "Open"}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}

    cursor = db["blood_requests"].find(query).sort("urgency", -1)
    requests = await cursor.to_list(length=100)
    for r in requests:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()
    return requests
