"""
Smart Follow-up Engine — Sehat-Sathi V2
========================================
Doctors create follow-up tasks for patients.
Patients receive automatic reminders for:
  - Review appointments
  - Medicine refills
  - Lab tests
  - General check-ins

Collections: follow_ups
Uses existing notifications system for reminders.
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, date
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas_v2 import FollowUpCreate

router = APIRouter(prefix="/followups", tags=["V2 — Follow-up Engine"])

VALID_TYPES = {"review", "medicine", "test", "general"}
VALID_STATUSES = {"pending", "completed", "missed"}


async def _notify(db, user_id: str, notif_type: str, title: str, message: str, metadata: dict = None):
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
        pass


def _serialize_followup(fu: dict) -> dict:
    fu["id"] = str(fu.pop("_id"))
    if isinstance(fu.get("created_at"), datetime):
        fu["created_at"] = fu["created_at"].isoformat()
    if isinstance(fu.get("completed_at"), datetime):
        fu["completed_at"] = fu["completed_at"].isoformat()
    # Add overdue flag
    today_str = date.today().isoformat()
    if fu.get("status") == "pending" and fu.get("due_date", "") < today_str:
        fu["is_overdue"] = True
    else:
        fu["is_overdue"] = False
    return fu


# ─────────────────────────────────────────────────────────────
# POST /followups/ — Doctor creates a follow-up
# ─────────────────────────────────────────────────────────────

@router.post("/")
async def create_followup(
    fu_data: FollowUpCreate,
    current_user: dict = Depends(verify_token)
):
    """
    Doctor creates a follow-up reminder for a specific patient.
    Patient is notified immediately via in-app notification.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create follow-up tasks")

    if fu_data.type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type. Allowed: {', '.join(VALID_TYPES)}")

    # Validate patient
    try:
        patient = await db["users"].find_one({"_id": ObjectId(fu_data.patient_id), "role": "Patient"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = await db["users"].find_one({"_id": ObjectId(user_id)})
    doctor_name = doctor.get("name", "Your Doctor") if doctor else "Your Doctor"
    patient_name = patient.get("name", "Patient")

    new_fu = {
        "doctor_id": user_id,
        "patient_id": fu_data.patient_id,
        "prescription_id": fu_data.prescription_id,
        "appointment_id": fu_data.appointment_id,
        "doctor_name": doctor_name,
        "patient_name": patient_name,
        "type": fu_data.type,
        "title": fu_data.title,
        "description": fu_data.description,
        "due_date": fu_data.due_date,
        "due_time": fu_data.due_time,
        "status": "pending",
        "created_at": datetime.now(),
        "completed_at": None,
        "notification_sent": False
    }

    result = await db["follow_ups"].insert_one(new_fu)
    fu_id = str(result.inserted_id)

    # Notify patient about the new follow-up
    type_label = {
        "review": "Review appointment",
        "medicine": "Medicine reminder",
        "test": "Lab test",
        "general": "Follow-up"
    }.get(fu_data.type, "Follow-up")

    await _notify(
        db, fu_data.patient_id, "followup_created",
        f"{type_label} Scheduled by Dr. {doctor_name} 🔔",
        f"Dr. {doctor_name} has scheduled a follow-up for you: {fu_data.title} on {fu_data.due_date}",
        {"followup_id": fu_id, "due_date": fu_data.due_date, "type": fu_data.type}
    )

    return {
        "success": True,
        "message": "Follow-up created and patient notified",
        "followup_id": fu_id
    }


# ─────────────────────────────────────────────────────────────
# GET /followups/my — Patient views their follow-ups
# ─────────────────────────────────────────────────────────────

@router.get("/my")
async def get_my_followups(
    status: str = None,
    current_user: dict = Depends(verify_token)
):
    """
    Patient: gets follow-ups assigned to them.
    Doctor: gets follow-ups they have created.
    Automatically marks overdue items and sends notifications on first detection.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role == "Patient":
        query = {"patient_id": user_id}
    elif role == "Doctor":
        query = {"doctor_id": user_id}
    else:
        raise HTTPException(status_code=403, detail="Access restricted to Patient or Doctor role")

    if status and status in VALID_STATUSES:
        query["status"] = status

    cursor = db["follow_ups"].find(query).sort("due_date", 1)
    followups = await cursor.to_list(length=500)

    today_str = date.today().isoformat()
    serialized = []
    for fu in followups:
        # Auto-mark as missed if past due date and still pending
        if fu.get("status") == "pending" and fu.get("due_date", "") < today_str:
            # Send overdue notification if not already sent
            if not fu.get("overdue_notified") and role == "Patient":
                await _notify(
                    db, user_id, "followup_overdue",
                    f"⚠️ Overdue Follow-up: {fu.get('title')}",
                    f"Your follow-up '{fu.get('title')}' scheduled for {fu.get('due_date')} is overdue. Please contact your doctor.",
                    {"followup_id": str(fu["_id"])}
                )
                await db["follow_ups"].update_one(
                    {"_id": fu["_id"]},
                    {"$set": {"overdue_notified": True}}
                )
        serialized.append(_serialize_followup(fu))

    return serialized


# ─────────────────────────────────────────────────────────────
# GET /followups/{id} — Get single follow-up
# ─────────────────────────────────────────────────────────────

@router.get("/{followup_id}")
async def get_followup(
    followup_id: str,
    current_user: dict = Depends(verify_token)
):
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    try:
        fu = await db["follow_ups"].find_one({"_id": ObjectId(followup_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid follow-up ID")
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    if role == "Patient" and fu["patient_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if role == "Doctor" and fu["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _serialize_followup(fu)


# ─────────────────────────────────────────────────────────────
# PUT /followups/{id}/complete — Mark follow-up as done
# ─────────────────────────────────────────────────────────────

@router.put("/{followup_id}/complete")
async def complete_followup(
    followup_id: str,
    current_user: dict = Depends(verify_token)
):
    """Patient or Doctor marks a follow-up as completed."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    try:
        fu = await db["follow_ups"].find_one({"_id": ObjectId(followup_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid follow-up ID")
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    if role == "Patient" and fu["patient_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if role == "Doctor" and fu["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if fu.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Follow-up is already completed")

    now = datetime.now()
    await db["follow_ups"].update_one(
        {"_id": ObjectId(followup_id)},
        {"$set": {"status": "completed", "completed_at": now}}
    )

    # Notify doctor when patient completes a follow-up
    if role == "Patient":
        patient = await db["users"].find_one({"_id": ObjectId(user_id)})
        patient_name = patient.get("name", "Patient") if patient else "Patient"
        await _notify(
            db, fu["doctor_id"], "followup_completed",
            f"Follow-up Completed ✅",
            f"{patient_name} has marked the follow-up '{fu.get('title')}' as completed.",
            {"followup_id": followup_id, "patient_id": user_id}
        )

    return {"success": True, "message": "Follow-up marked as completed"}


# ─────────────────────────────────────────────────────────────
# DELETE /followups/{id} — Doctor cancels a follow-up
# ─────────────────────────────────────────────────────────────

@router.delete("/{followup_id}")
async def delete_followup(
    followup_id: str,
    current_user: dict = Depends(verify_token)
):
    """Doctor cancels/deletes a follow-up task."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can delete follow-up tasks")

    try:
        fu = await db["follow_ups"].find_one({"_id": ObjectId(followup_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid follow-up ID")
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    if fu["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own follow-up tasks")

    await db["follow_ups"].delete_one({"_id": ObjectId(followup_id)})
    return {"success": True, "message": "Follow-up cancelled"}
