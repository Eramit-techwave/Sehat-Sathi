"""
Hospital Routes — Public Discovery + Management
================================================
Public endpoints: hospital listing, search (only approved/public hospitals)
Authenticated endpoints: hospital management (Hospital role only)
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from app.database import get_db
from app.auth_utils import verify_token, require_role
from app.schemas import HospitalProfile, BedAvailabilityUpdate, HospitalAnnouncement, RoomBookingCreate
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

HospitalOnly = Depends(require_role("Hospital", "Admin"))


# ─────────────────────────────────────────────────────────────
# PUBLIC ENDPOINTS (no auth required)
# ─────────────────────────────────────────────────────────────

@router.get("/")
async def list_public_hospitals(
    search: Optional[str] = None,
    department: Optional[str] = None,
    city: Optional[str] = None
):
    """
    Public list of approved, publicly-listed hospitals.
    Patients use this for discovery. Only verified hospitals appear here.
    """
    db = get_db()
    query = {"verification_status": "approved", "is_publicly_listed": True}

    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}}
        ]
    if department:
        query["departments"] = {"$in": [department]}
    if city:
        query["address"] = {"$regex": city, "$options": "i"}

    hospitals = await db["hospitals"].find(query).to_list(length=100)

    result = []
    for hosp in hospitals:
        user = await db["users"].find_one({"_id": ObjectId(hosp["user_id"])})
        if user:
            # Count doctors affiliated with this hospital
            doctor_count = await db["doctors"].count_documents({
                "verification_status": "approved",
                "$or": [
                    {"hospital_id": hosp["user_id"]},
                    {"hospital_associations.hospital_id": hosp["user_id"]},
                ],
            })
            result.append({
                "id": hosp["user_id"],
                "name": user.get("name"),
                "address": hosp.get("address", ""),
                "city": hosp.get("city", ""),
                "state": hosp.get("state", ""),
                "pincode": hosp.get("pincode", ""),
                "lat": hosp.get("lat"),
                "lng": hosp.get("lng"),
                "phone": hosp.get("phone") or user.get("phone"),
                "website": hosp.get("website", ""),
                "departments": hosp.get("departments", []),
                "facilities": hosp.get("facilities", []),
                "bed_availability": hosp.get("bed_availability", {}),
                "doctor_count": doctor_count,
                "emergency_available": hosp.get("bed_availability", {}).get("emergency", False) or bool(hosp.get("emergency_phone")),
                "emergency_phone": hosp.get("emergency_phone", ""),
                "opening_hours": hosp.get("opening_hours", ""),
                "announcements": [
                    a for a in hosp.get("announcements", [])
                    if not a.get("expires_at") or a.get("expires_at") > datetime.now().isoformat()
                ][-3:]  # Show last 3 active announcements
            })
    return result


@router.get("/{hospital_id}/doctors")
async def list_hospital_doctors(hospital_id: str):
    """Public hospital directory backed by the canonical doctor profile collection."""
    db = get_db()
    hospital = await db["hospitals"].find_one({
        "user_id": hospital_id,
        "verification_status": "approved",
    })
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found or not yet verified")

    profiles = await db["doctors"].find({
        "verification_status": "approved",
        "$or": [
            {"hospital_id": hospital_id},
            {"hospital_associations.hospital_id": hospital_id},
        ],
    }).to_list(length=100)

    doctors = []
    for profile in profiles:
        try:
            user = await db["users"].find_one({"_id": ObjectId(profile["user_id"])})
        except Exception:
            user = None
        if not user:
            continue
        doctors.append({
            "id": profile["user_id"],
            "name": user.get("name", "Doctor"),
            "profile_photo": user.get("profile_photo_url"),
            "specialty": profile.get("specialty", "General Physician"),
            "qualifications": profile.get("qualifications", ""),
            "experience_years": profile.get("experience_years", 0),
            "consultation_fee": profile.get("consultation_fee"),
            "online_status": profile.get("online_status", "offline"),
            "availability": profile.get("availability", {}),
            "clinic_address": profile.get("clinic_address", ""),
        })
    return doctors


@router.get("/{hospital_id}")
async def get_hospital_public_profile(hospital_id: str):
    """Get a single hospital's public profile."""
    db = get_db()
    hosp = await db["hospitals"].find_one({
        "user_id": hospital_id,
        "verification_status": "approved"
    })
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found or not yet verified")

    user = await db["users"].find_one({"_id": ObjectId(hospital_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Get affiliated doctors (approved only)
    affiliated_doctors = await db["doctors"].find({
        "verification_status": "approved",
        "$or": [
            {"hospital_id": hospital_id},
            {"hospital_associations.hospital_id": hospital_id},
        ],
    }).to_list(length=50)

    doctors_list = []
    for doc in affiliated_doctors:
        doc_user = await db["users"].find_one({"_id": ObjectId(doc["user_id"])})
        if doc_user:
            doctors_list.append({
                "id": doc["user_id"],
                "name": doc_user.get("name"),
                "specialty": doc.get("specialty", "General"),
                "qualifications": doc.get("qualifications", ""),
                "experience_years": doc.get("experience_years", 0),
                "bio": doc.get("bio", "")
            })

    return {
        "id": hospital_id,
        "name": user.get("name"),
        "address": hosp.get("address", ""),
        "city": hosp.get("city", ""),
        "state": hosp.get("state", ""),
        "pincode": hosp.get("pincode", ""),
        "lat": hosp.get("lat"),
        "lng": hosp.get("lng"),
        "phone": hosp.get("phone") or user.get("phone"),
        "website": hosp.get("website", ""),
        "departments": hosp.get("departments", []),
        "facilities": hosp.get("facilities", []),
        "bed_availability": hosp.get("bed_availability", {}),
        "bed_counts": hosp.get("bed_counts", {}),
        "opening_hours": hosp.get("opening_hours", ""),
        "emergency_phone": hosp.get("emergency_phone", ""),
        "emergency_available": hosp.get("bed_availability", {}).get("emergency", False) or bool(hosp.get("emergency_phone")),
        "affiliated_doctors": doctors_list,
        "announcements": hosp.get("announcements", [])
    }


# ─────────────────────────────────────────────────────────────
# HOSPITAL SELF-MANAGEMENT (Hospital role only)
# ─────────────────────────────────────────────────────────────

@router.get("/me/profile")
async def get_my_hospital_profile(current_user: dict = Depends(verify_token)):
    """Hospital gets their own full profile."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Hospital":
        raise HTTPException(status_code=403, detail="Access restricted to Hospital role")

    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hosp = await db["hospitals"].find_one({"user_id": user_id})
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    return {
        "id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": hosp.get("phone") or user.get("phone"),
        "address": hosp.get("address", ""),
        "website": hosp.get("website", ""),
        "departments": hosp.get("departments", []),
        "facilities": hosp.get("facilities", []),
        "registration_number": hosp.get("registration_number", ""),
        "hospital_platform_id": hosp.get("hospital_platform_id", ""),
        "verification_status": hosp.get("verification_status", "pending"),
        "rejection_reason": hosp.get("rejection_reason"),
        "bed_counts": hosp.get("bed_counts", {"general": 0, "icu": 0, "emergency": 0}),
        "bed_availability": hosp.get("bed_availability", {"general": True, "icu": True, "emergency": True}),
        "is_publicly_listed": hosp.get("is_publicly_listed", False),
        "announcements": hosp.get("announcements", [])
    }


@router.put("/me/profile")
async def update_my_hospital_profile(
    profile_data: HospitalProfile,
    current_user: dict = Depends(verify_token)
):
    """Hospital updates their profile information."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Hospital":
        raise HTTPException(status_code=403, detail="Access restricted to Hospital role")

    update_dict = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if not update_dict:
        return {"success": True, "message": "No changes to update"}

    await db["hospitals"].update_one(
        {"user_id": user_id},
        {"$set": update_dict},
        upsert=True
    )
    return {"success": True, "message": "Hospital profile updated successfully"}


@router.put("/me/bed-availability")
async def update_bed_availability(
    bed_data: BedAvailabilityUpdate,
    current_user: dict = Depends(verify_token)
):
    """Hospital updates real-time bed availability status."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Hospital":
        raise HTTPException(status_code=403, detail="Access restricted to Hospital role")

    update_fields = {
        f"bed_availability.{k}": v
        for k, v in bed_data.model_dump().items()
        if v is not None
    }

    if not update_fields:
        return {"success": True, "message": "No changes to update"}

    await db["hospitals"].update_one(
        {"user_id": user_id},
        {"$set": update_fields}
    )
    return {"success": True, "message": "Bed availability updated"}


@router.post("/me/announcements")
async def create_announcement(
    announcement: HospitalAnnouncement,
    current_user: dict = Depends(verify_token)
):
    """Hospital creates a public announcement."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Hospital":
        raise HTTPException(status_code=403, detail="Access restricted to Hospital role")

    new_announcement = {
        "id": str(ObjectId()),
        "title": announcement.title,
        "content": announcement.content,
        "created_at": datetime.now().isoformat()
    }

    await db["hospitals"].update_one(
        {"user_id": user_id},
        {"$push": {"announcements": {"$each": [new_announcement], "$slice": -20}}}
    )
    return {"success": True, "message": "Announcement published", "announcement": new_announcement}


@router.delete("/me/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    current_user: dict = Depends(verify_token)
):
    """Hospital deletes one of their announcements."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Hospital":
        raise HTTPException(status_code=403, detail="Access restricted to Hospital role")

    await db["hospitals"].update_one(
        {"user_id": user_id},
        {"$pull": {"announcements": {"id": announcement_id}}}
    )
    return {"success": True, "message": "Announcement removed"}


@router.get("/me/stats")
async def get_hospital_stats(current_user: dict = Depends(verify_token)):
    """Hospital operational analytics dashboard data."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role not in ["Hospital", "Admin"]:
        raise HTTPException(status_code=403, detail="Access restricted to Hospital or Admin role")

    today = datetime.now().strftime("%Y-%m-%d")
    total_apts = await db["appointments"].find({"hospital_id": user_id}).to_list(length=1000)
    today_apts = [a for a in total_apts if a.get("date") == today]
    pending_apts = [a for a in total_apts if a.get("status") == "Pending"]
    confirmed_apts = [a for a in total_apts if a.get("status") == "Confirmed"]
    cancelled_apts = [a for a in total_apts if a.get("status") == "Cancelled"]

    # Last 7 days trend
    trend = []
    for i in range(6, -1, -1):
        day = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        count = len([a for a in total_apts if a.get("date") == day])
        trend.append({"date": day, "count": count})

    # Affiliated doctors count
    doctor_count = await db["doctors"].count_documents({
        "hospital_id": user_id,
        "verification_status": "approved"
    })

    # Unique patients
    patient_ids = list(set(a.get("patient_id") for a in total_apts if a.get("patient_id")))

    return {
        "total_appointments": len(total_apts),
        "today_appointments": len(today_apts),
        "pending_appointments": len(pending_apts),
        "confirmed_appointments": len(confirmed_apts),
        "cancelled_appointments": len(cancelled_apts),
        "cancellation_rate": round(len(cancelled_apts) / max(len(total_apts), 1) * 100, 1),
        "total_patients": len(patient_ids),
        "affiliated_doctors": doctor_count,
        "appointment_trend_7days": trend
    }


@router.get("/me/doctors")
async def get_hospital_doctors(current_user: dict = Depends(verify_token)):
    """List all doctors affiliated with this hospital (via hospital_id or hospital_associations)."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role not in ["Hospital", "Admin"]:
        raise HTTPException(status_code=403, detail="Access restricted to Hospital or Admin role")

    # Find doctors affiliated via legacy hospital_id OR new hospital_associations
    affiliated = await db["doctors"].find({
        "$or": [
            {"hospital_id": user_id},
            {"hospital_associations.hospital_id": user_id}
        ]
    }).to_list(length=100)

    seen_ids = set()
    result = []
    for doc in affiliated:
        doc_id = doc["user_id"]
        if doc_id in seen_ids:
            continue
        seen_ids.add(doc_id)

        doc_user = await db["users"].find_one({"_id": ObjectId(doc_id)})
        if doc_user:
            # Find the role in this specific hospital's association
            assoc_role = "Consultant"
            for assoc in doc.get("hospital_associations", []):
                if assoc.get("hospital_id") == user_id:
                    assoc_role = assoc.get("role", "Consultant")
                    break

            result.append({
                "id": doc_id,
                "name": doc_user.get("name"),
                "email": doc_user.get("email"),
                "specialty": doc.get("specialty", "General"),
                "qualifications": doc.get("qualifications", ""),
                "experience_years": doc.get("experience_years", 0),
                "verification_status": doc.get("verification_status", "pending"),
                "practice_type": doc.get("practice_type", "independent"),
                "consultation_fee": doc.get("consultation_fee"),
                "association_role": assoc_role
            })
    return result


# ─────────────────────────────────────────────────────────────
# HOSPITAL ROOM / BED BOOKING ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.post("/book-room")
async def book_hospital_room(
    booking: RoomBookingCreate,
    current_user: dict = Depends(verify_token)
):
    """
    Book a hospital bed / room (General Ward, Semi-Private, Deluxe AC, ICU, VIP Suite).
    Calculates 18% GST and total stay charges, creates booking record, and fires notifications.
    """
    db = get_db()
    user_id = current_user.get("sub")

    # Resolve hospital user & name
    try:
        hosp_oid = ObjectId(booking.hospital_id) if len(booking.hospital_id) == 24 else None
        hosp_user = await db["users"].find_one({"_id": hosp_oid}) if hosp_oid else None
    except Exception:
        hosp_user = None

    hospital_name = hosp_user.get("name", "Sehat-Sathi Partnered Hospital") if hosp_user else "Sehat-Sathi Partnered Hospital"

    # Financial calculation
    daily_rate = round(booking.daily_rate, 2)
    days = max(1, booking.duration_days)
    base_amount = round(daily_rate * days, 2)
    tax_amount = round(base_amount * 0.18, 2)
    total_amount = round(base_amount + tax_amount, 2)

    txn_id = booking.transaction_id or f"ROOM-TXN-{int(datetime.now().timestamp() * 1000)}"
    booking_ref = f"ROOM-2026-{int(datetime.now().timestamp()) % 1000000}"

    booking_doc = {
        "user_id": user_id,
        "hospital_id": booking.hospital_id,
        "hospital_name": hospital_name,
        "room_type": booking.room_type,
        "daily_rate": daily_rate,
        "duration_days": days,
        "admission_date": booking.admission_date,
        "patient_name": booking.patient_name,
        "patient_age": booking.patient_age,
        "patient_gender": booking.patient_gender,
        "contact_phone": booking.contact_phone,
        "attendant_name": booking.attendant_name,
        "attendant_relation": booking.attendant_relation,
        "reason": booking.reason or "Hospital Bed Admission",
        "base_amount": base_amount,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "payment_method": (booking.payment_method or "UPI").upper(),
        "payment_status": booking.payment_status or "Paid",
        "transaction_id": txn_id,
        "booking_reference": booking_ref,
        "status": "Confirmed" if (booking.payment_status or "Paid").lower() == "paid" else "Pending",
        "created_at": datetime.now()
    }

    res = await db["hospital_room_bookings"].insert_one(booking_doc)
    booking_id = str(res.inserted_id)

    # Automatically generate invoice for room booking
    inv_number = f"INV-ROOM-2026-{int(datetime.now().timestamp()) % 100000}"
    inv_doc = {
        "invoice_number": inv_number,
        "user_id": user_id,
        "patient_name": booking.patient_name,
        "patient_id": f"PAT-{(user_id[:6]).upper()}",
        "doctor_name": f"{booking.room_type} Specialist Team",
        "doctor_specialization": "Inpatient Hospital Care",
        "hospital_name": hospital_name,
        "service_name": f"Hospital Room Reservation ({booking.room_type} - {days} Days)",
        "base_amount": base_amount,
        "tax_rate": 18.0,
        "tax_amount": tax_amount,
        "discount": 0.0,
        "total_amount": total_amount,
        "payment_method": (booking.payment_method or "UPI").upper(),
        "payment_status": booking.payment_status or "Paid",
        "reference_number": txn_id,
        "transaction_id": txn_id,
        "founder_name": "Amit Dubey",
        "company_name": "Sehat-Sathi",
        "company_url": "www.sehatsathi.com",
        "created_at": datetime.now()
    }

    try:
        await db["invoices"].insert_one(inv_doc)
    except Exception as e:
        print("[WARN] Room invoice auto-creation note:", e)

    # Send Notification to Patient
    try:
        await db["notifications"].insert_one({
            "user_id": user_id,
            "type": "room_booked",
            "title": "Hospital Room Booked Successfully 🏥",
            "message": f"Your {booking.room_type} at {hospital_name} is reserved for {booking.admission_date} ({days} days). Total: ₹{total_amount}",
            "is_read": False,
            "metadata": {"booking_id": booking_id, "transaction_id": txn_id},
            "created_at": datetime.now()
        })
    except Exception:
        pass

    # Send Notification to Hospital
    if booking.hospital_id and len(booking.hospital_id) == 24:
        try:
            await db["notifications"].insert_one({
                "user_id": booking.hospital_id,
                "type": "room_booked",
                "title": "New Hospital Room Booking 🛌",
                "message": f"Patient {booking.patient_name} booked {booking.room_type} starting {booking.admission_date} ({days} days).",
                "is_read": False,
                "metadata": {"booking_id": booking_id, "patient_name": booking.patient_name},
                "created_at": datetime.now()
            })
        except Exception:
            pass

    return {
        "success": True,
        "message": f"Hospital room ({booking.room_type}) booked successfully!",
        "booking_id": booking_id,
        "booking_reference": booking_ref,
        "transaction_id": txn_id,
        "total_amount": total_amount,
        "hospital_name": hospital_name,
        "status": booking_doc["status"]
    }


@router.get("/my-room-bookings")
async def get_my_room_bookings(current_user: dict = Depends(verify_token)):
    """Fetch room bookings created by current patient."""
    db = get_db()
    user_id = current_user.get("sub")

    cursor = db["hospital_room_bookings"].find({"user_id": user_id}).sort("created_at", -1)
    bookings = await cursor.to_list(length=100)
    for b in bookings:
        b["id"] = str(b["_id"])
        b.pop("_id", None)
        if isinstance(b.get("created_at"), datetime):
            b["created_at"] = b["created_at"].isoformat()
    return bookings


@router.get("/me/room-bookings")
async def get_hospital_received_room_bookings(current_user: dict = Depends(verify_token)):
    """Hospital dashboard route: List room bookings received by this hospital."""
    db = get_db()
    user_id = current_user.get("sub")

    cursor = db["hospital_room_bookings"].find({"hospital_id": user_id}).sort("created_at", -1)
    bookings = await cursor.to_list(length=200)
    for b in bookings:
        b["id"] = str(b["_id"])
        b.pop("_id", None)
        if isinstance(b.get("created_at"), datetime):
            b["created_at"] = b["created_at"].isoformat()
    return bookings


@router.put("/room-bookings/{booking_id}/status")
async def update_room_booking_status(
    booking_id: str,
    status: str,
    current_user: dict = Depends(verify_token)
):
    """Update status of a room booking (Confirmed, Admitted, Discharged, Cancelled)."""
    db = get_db()
    try:
        b_oid = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")

    allowed = ["Pending", "Confirmed", "Admitted", "Discharged", "Cancelled"]
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(allowed)}")

    res = await db["hospital_room_bookings"].update_one(
        {"_id": b_oid},
        {"$set": {"status": status, "updated_at": datetime.now()}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room booking not found")

    return {"success": True, "message": f"Booking status updated to '{status}'"}

