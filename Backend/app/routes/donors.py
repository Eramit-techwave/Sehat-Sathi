from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.auth_utils import verify_token
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/donors", tags=["Blood Donors"])


class DonorRegistration(BaseModel):
    fullName: str
    phone: str
    bloodGroup: str
    age: str
    city: str
    state: str
    lastDonation: Optional[str] = None


class BloodRequest(BaseModel):
    patientName: str
    bloodGroup: str
    hospital: str
    city: str
    urgency: str
    phone: str


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
async def register_donor(donor: DonorRegistration, current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    # Check if already registered
    existing = await db["donors"].find_one({"user_id": user_id})
    if existing:
        # Update instead
        await db["donors"].update_one(
            {"user_id": user_id},
            {"$set": {
                "name": donor.fullName,
                "phone": donor.phone,
                "bloodGroup": donor.bloodGroup,
                "age": donor.age,
                "city": donor.city,
                "state": donor.state,
                "lastDonation": donor.lastDonation,
                "available": True,
                "updated_at": datetime.now()
            }}
        )
        return {"success": True, "message": "Donor profile updated successfully!"}

    new_donor = {
        "user_id": user_id,
        "name": donor.fullName,
        "phone": donor.phone,
        "bloodGroup": donor.bloodGroup,
        "age": donor.age,
        "city": donor.city,
        "state": donor.state,
        "lastDonation": donor.lastDonation,
        "available": True,
        "registered_at": datetime.now()
    }
    await db["donors"].insert_one(new_donor)
    return {"success": True, "message": "Registered as blood donor! You may save a life today. 🩸"}


@router.post("/request")
async def request_blood(request: BloodRequest, current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    blood_request = {
        "requested_by": user_id,
        "patientName": request.patientName,
        "bloodGroup": request.bloodGroup,
        "hospital": request.hospital,
        "city": request.city,
        "urgency": request.urgency,
        "phone": request.phone,
        "status": "Open",
        "created_at": datetime.now()
    }
    result = await db["blood_requests"].insert_one(blood_request)
    return {"success": True, "message": "Blood request submitted! Donors in your area will be notified.", "request_id": str(result.inserted_id)}


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
