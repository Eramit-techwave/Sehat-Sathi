"""
Admin Routes — Platform Management
====================================
All endpoints require Admin role (enforced via require_role("Admin")).
Covers: Doctor/Hospital verification, user management, platform analytics.
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from app.database import get_db
from app.auth_utils import require_role
from app.schemas import AdminApprovalAction

router = APIRouter(prefix="/admin", tags=["Admin — Platform Control"])

# Convenience alias for the Admin-only dependency
AdminOnly = Depends(require_role("Admin"))


# ─────────────────────────────────────────────────────────────
# PLATFORM STATS
# ─────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_platform_stats(current_user: dict = AdminOnly):
    """Platform-wide analytics overview for the Admin dashboard."""
    db = get_db()

    total_users = await db["users"].count_documents({})
    total_patients = await db["users"].count_documents({"role": "Patient"})
    total_doctors = await db["users"].count_documents({"role": "Doctor"})
    total_hospitals = await db["users"].count_documents({"role": "Hospital"})

    pending_doctors = await db["doctors"].count_documents({"verification_status": "pending"})
    approved_doctors = await db["doctors"].count_documents({"verification_status": "approved"})
    pending_hospitals = await db["hospitals"].count_documents({"verification_status": "pending"})
    approved_hospitals = await db["hospitals"].count_documents({"verification_status": "approved"})

    total_appointments = await db["appointments"].count_documents({})
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_appointments = await db["appointments"].count_documents({"date": today_str})
    pending_appointments = await db["appointments"].count_documents({"status": "Pending"})

    total_reports = await db["reports"].count_documents({})

    # Last 7 days appointment trend
    trend = []
    for i in range(6, -1, -1):
        day = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        count = await db["appointments"].count_documents({"date": day})
        trend.append({"date": day, "count": count})

    return {
        "users": {
            "total": total_users,
            "patients": total_patients,
            "doctors": total_doctors,
            "hospitals": total_hospitals
        },
        "verification": {
            "pending_doctors": pending_doctors,
            "approved_doctors": approved_doctors,
            "pending_hospitals": pending_hospitals,
            "approved_hospitals": approved_hospitals
        },
        "appointments": {
            "total": total_appointments,
            "today": today_appointments,
            "pending": pending_appointments
        },
        "reports_analyzed": total_reports,
        "appointment_trend_7days": trend
    }


# ─────────────────────────────────────────────────────────────
# DOCTOR VERIFICATION MANAGEMENT
# ─────────────────────────────────────────────────────────────

@router.get("/doctors/pending")
async def get_pending_doctors(current_user: dict = AdminOnly):
    """List all doctors awaiting verification."""
    db = get_db()
    pending = await db["doctors"].find({"verification_status": "pending"}).to_list(length=200)

    result = []
    for doc in pending:
        user = await db["users"].find_one({"_id": ObjectId(doc["user_id"])})
        if user:
            result.append({
                "id": doc["user_id"],
                "doctor_profile_id": str(doc["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "phone": user.get("phone"),
                "specialty": doc.get("specialty", "General"),
                "qualifications": doc.get("qualifications", ""),
                "medical_reg_number": doc.get("medical_reg_number", ""),
                "verification_status": doc.get("verification_status"),
                "kyc_status": doc.get("kyc_status", "not_submitted"),
                "created_at": doc.get("created_at", "").isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
            })
    return result


@router.get("/doctors/all")
async def get_all_doctors(current_user: dict = AdminOnly):
    """List all doctors with their verification status."""
    db = get_db()
    all_docs = await db["doctors"].find({}).to_list(length=500)

    result = []
    for doc in all_docs:
        user = await db["users"].find_one({"_id": ObjectId(doc["user_id"])})
        if user:
            result.append({
                "id": doc["user_id"],
                "name": user.get("name"),
                "email": user.get("email"),
                "specialty": doc.get("specialty", "General"),
                "medical_reg_number": doc.get("medical_reg_number", ""),
                "verification_status": doc.get("verification_status", "pending"),
                "verified_at": doc.get("verified_at", "").isoformat() if isinstance(doc.get("verified_at"), datetime) else None
            })
    return result


@router.put("/doctors/{doctor_user_id}/verify")
async def verify_doctor(
    doctor_user_id: str,
    action_data: AdminApprovalAction,
    current_user: dict = AdminOnly
):
    """Approve or reject a doctor's verification."""
    db = get_db()
    admin_id = current_user.get("sub")

    if action_data.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    if action_data.action == "reject" and not action_data.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    doctor_profile = await db["doctors"].find_one({"user_id": doctor_user_id})
    if not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    new_status = "approved" if action_data.action == "approve" else "rejected"

    await db["doctors"].update_one(
        {"user_id": doctor_user_id},
        {"$set": {
            "verification_status": new_status,
            "rejection_reason": action_data.reason if new_status == "rejected" else None,
            "verified_at": datetime.now() if new_status == "approved" else None,
            "verified_by": admin_id
        }}
    )

    # Create notification for the doctor
    user = await db["users"].find_one({"_id": ObjectId(doctor_user_id)})
    if user:
        if new_status == "approved":
            notif_title = "Account Verified! ✅"
            notif_msg = "Congratulations! Your doctor account has been verified. You can now access your dashboard and receive patients."
        else:
            notif_title = "Verification Update"
            notif_msg = f"Your doctor account verification was not approved. Reason: {action_data.reason}"

        await db["notifications"].insert_one({
            "user_id": doctor_user_id,
            "type": f"verification_{new_status}",
            "title": notif_title,
            "message": notif_msg,
            "is_read": False,
            "metadata": {"action": action_data.action, "reason": action_data.reason},
            "created_at": datetime.now()
        })

    return {
        "success": True,
        "message": f"Doctor account {new_status} successfully",
        "doctor_id": doctor_user_id,
        "new_status": new_status
    }


# ─────────────────────────────────────────────────────────────
# HOSPITAL VERIFICATION MANAGEMENT
# ─────────────────────────────────────────────────────────────

@router.get("/hospitals/pending")
async def get_pending_hospitals(current_user: dict = AdminOnly):
    """List all hospitals awaiting verification."""
    db = get_db()
    pending = await db["hospitals"].find({"verification_status": "pending"}).to_list(length=200)

    result = []
    for hosp in pending:
        user = await db["users"].find_one({"_id": ObjectId(hosp["user_id"])})
        if user:
            result.append({
                "id": hosp["user_id"],
                "hospital_profile_id": str(hosp["_id"]),
                "name": user.get("name"),
                "email": user.get("email"),
                "phone": hosp.get("phone") or user.get("phone"),
                "address": hosp.get("address", ""),
                "registration_number": hosp.get("registration_number", ""),
                "departments": hosp.get("departments", []),
                "verification_status": hosp.get("verification_status"),
                "created_at": hosp.get("created_at", "").isoformat() if isinstance(hosp.get("created_at"), datetime) else str(hosp.get("created_at", ""))
            })
    return result


@router.get("/hospitals/all")
async def get_all_hospitals(current_user: dict = AdminOnly):
    """List all hospitals with their verification status."""
    db = get_db()
    all_hosps = await db["hospitals"].find({}).to_list(length=500)

    result = []
    for hosp in all_hosps:
        user = await db["users"].find_one({"_id": ObjectId(hosp["user_id"])})
        if user:
            result.append({
                "id": hosp["user_id"],
                "name": user.get("name"),
                "email": user.get("email"),
                "address": hosp.get("address", ""),
                "registration_number": hosp.get("registration_number", ""),
                "verification_status": hosp.get("verification_status", "pending"),
                "is_publicly_listed": hosp.get("is_publicly_listed", False)
            })
    return result


@router.put("/hospitals/{hospital_user_id}/verify")
async def verify_hospital(
    hospital_user_id: str,
    action_data: AdminApprovalAction,
    current_user: dict = AdminOnly
):
    """Approve or reject a hospital's verification."""
    db = get_db()
    admin_id = current_user.get("sub")

    if action_data.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    if action_data.action == "reject" and not action_data.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    hosp_profile = await db["hospitals"].find_one({"user_id": hospital_user_id})
    if not hosp_profile:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    new_status = "approved" if action_data.action == "approve" else "rejected"
    is_public = new_status == "approved"

    await db["hospitals"].update_one(
        {"user_id": hospital_user_id},
        {"$set": {
            "verification_status": new_status,
            "is_publicly_listed": is_public,
            "rejection_reason": action_data.reason if new_status == "rejected" else None,
            "verified_at": datetime.now() if new_status == "approved" else None,
            "verified_by": admin_id
        }}
    )

    # Notify hospital
    if new_status == "approved":
        notif_title = "Hospital Verified! 🏥"
        notif_msg = "Your hospital is now verified and publicly listed on SehatSathi. Patients can find and book appointments."
    else:
        notif_title = "Verification Update"
        notif_msg = f"Your hospital registration was not approved. Reason: {action_data.reason}"

    await db["notifications"].insert_one({
        "user_id": hospital_user_id,
        "type": f"verification_{new_status}",
        "title": notif_title,
        "message": notif_msg,
        "is_read": False,
        "metadata": {"action": action_data.action, "reason": action_data.reason},
        "created_at": datetime.now()
    })

    return {
        "success": True,
        "message": f"Hospital account {new_status} successfully",
        "hospital_id": hospital_user_id,
        "new_status": new_status,
        "is_publicly_listed": is_public
    }


# ─────────────────────────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────────────────────────

@router.get("/users")
async def get_all_users(
    page: int = 1,
    limit: int = 50,
    role: str = None,
    search: str = None,
    current_user: dict = AdminOnly
):
    """Paginated list of all users with optional role/search filter."""
    db = get_db()

    query = {}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    skip = (page - 1) * limit
    total = await db["users"].count_documents(query)
    cursor = db["users"].find(query).skip(skip).limit(limit).sort("created_at", -1)
    users = await cursor.to_list(length=limit)

    for u in users:
        u.pop("password", None)
        u["id"] = str(u["_id"])
        u.pop("_id", None)
        if isinstance(u.get("created_at"), datetime):
            u["created_at"] = u["created_at"].isoformat()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "users": users
    }


@router.put("/users/{user_id}/suspend")
async def suspend_user(user_id: str, current_user: dict = AdminOnly):
    """Suspend a user account (sets is_active=False)."""
    db = get_db()
    try:
        result = await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": False, "suspended_at": datetime.now()}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "User account suspended"}


@router.put("/users/{user_id}/reinstate")
async def reinstate_user(user_id: str, current_user: dict = AdminOnly):
    """Reinstate a suspended user account."""
    db = get_db()
    try:
        result = await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": True}, "$unset": {"suspended_at": ""}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "User account reinstated"}
