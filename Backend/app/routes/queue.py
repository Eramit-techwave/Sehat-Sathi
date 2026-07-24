"""
Hospital Queue Management — Sehat-Sathi V2 (Scaffolded)
=========================================================
Hospital reception adds patients to the queue.
Patients receive live position updates via polling.
Full real-time (WebSocket) upgrade planned for V3.

Collection: queue_entries
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, date
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas_v2 import QueueEntryCreate

router = APIRouter(prefix="/queue", tags=["V2 — Queue Management"])


async def _notify(db, user_id, notif_type, title, message, metadata=None):
    try:
        await db["notifications"].insert_one({
            "user_id": user_id, "type": notif_type, "title": title,
            "message": message, "is_read": False,
            "metadata": metadata or {}, "created_at": datetime.now()
        })
    except Exception:
        pass


def _serialize(entry: dict) -> dict:
    entry["id"] = str(entry.pop("_id"))
    if isinstance(entry.get("added_at"), datetime):
        entry["added_at"] = entry["added_at"].isoformat()
    if isinstance(entry.get("called_at"), datetime):
        entry["called_at"] = entry["called_at"].isoformat()
    if isinstance(entry.get("completed_at"), datetime):
        entry["completed_at"] = entry["completed_at"].isoformat()
    return entry


@router.post("/add")
async def add_to_queue(
    entry: QueueEntryCreate,
    current_user: dict = Depends(verify_token)
):
    """Hospital/Reception adds a patient to today's queue."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role not in ["Hospital", "Doctor", "Admin"]:
        raise HTTPException(status_code=403, detail="Only Hospital staff can manage queues")

    # Determine which hospital this belongs to
    hospital_id = user_id if role == "Hospital" else None

    # Count today's queue for position number
    today = date.today().isoformat()
    today_count = await db["queue_entries"].count_documents({
        "hospital_id": hospital_id,
        "date": today,
        "status": {"$ne": "completed"}
    })
    position = today_count + 1

    new_entry = {
        "hospital_id": hospital_id,
        "patient_id": entry.patient_id,
        "department": entry.department,
        "appointment_id": entry.appointment_id,
        "priority": entry.priority or "normal",
        "notes": entry.notes,
        "position": position,
        "status": "waiting",  # waiting | called | completed | skipped
        "date": today,
        "added_at": datetime.now(),
        "called_at": None,
        "completed_at": None
    }

    result = await db["queue_entries"].insert_one(new_entry)
    entry_id = str(result.inserted_id)

    # Notify patient
    await _notify(
        db, entry.patient_id, "queue_added",
        f"You're in the Queue 🏥",
        f"You've been added to the {entry.department} queue. Your position: #{position}",
        {"queue_id": entry_id, "position": position, "department": entry.department}
    )

    return {
        "success": True,
        "queue_id": entry_id,
        "position": position,
        "message": f"Patient added to queue at position #{position}"
    }


@router.get("/today")
async def get_today_queue(
    department: str = None,
    current_user: dict = Depends(verify_token)
):
    """Hospital gets today's queue. Patients get their own queue position."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")
    today = date.today().isoformat()

    if role == "Patient":
        # Patient sees their own position
        query = {"patient_id": user_id, "date": today, "status": {"$ne": "completed"}}
    elif role in ["Hospital", "Admin"]:
        query = {"hospital_id": user_id if role == "Hospital" else {"$exists": True}, "date": today}
        if department:
            query["department"] = department
    else:
        raise HTTPException(status_code=403, detail="Access denied")

    cursor = db["queue_entries"].find(query).sort("position", 1)
    entries = await cursor.to_list(length=300)

    # Enrich with patient names for hospital view
    result = []
    for entry in entries:
        try:
            patient = await db["users"].find_one({"_id": ObjectId(entry["patient_id"])})
            entry["patient_name"] = patient.get("name", "Patient") if patient else "Patient"
        except Exception:
            entry["patient_name"] = "Patient"
        result.append(_serialize(entry))

    return {"date": today, "total": len(result), "queue": result}


@router.put("/{queue_id}/call")
async def call_patient(queue_id: str, current_user: dict = Depends(verify_token)):
    """Hospital calls a patient from the queue."""
    db = get_db()
    role = current_user.get("role")
    if role not in ["Hospital", "Doctor", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        entry = await db["queue_entries"].find_one({"_id": ObjectId(queue_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid queue entry ID")
    if not entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    await db["queue_entries"].update_one(
        {"_id": ObjectId(queue_id)},
        {"$set": {"status": "called", "called_at": datetime.now()}}
    )

    await _notify(
        db, entry["patient_id"], "queue_called",
        "It's Your Turn! 🔔",
        f"Please proceed to the {entry.get('department', '')} counter. Your turn has arrived.",
        {"queue_id": queue_id}
    )

    return {"success": True, "message": "Patient called and notified"}


@router.put("/{queue_id}/complete")
async def complete_queue_entry(queue_id: str, current_user: dict = Depends(verify_token)):
    """Mark queue entry as completed."""
    db = get_db()
    role = current_user.get("role")
    if role not in ["Hospital", "Doctor", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        await db["queue_entries"].update_one(
            {"_id": ObjectId(queue_id)},
            {"$set": {"status": "completed", "completed_at": datetime.now()}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid queue entry ID")

    return {"success": True, "message": "Queue entry marked complete"}


@router.delete("/{queue_id}")
async def remove_from_queue(queue_id: str, current_user: dict = Depends(verify_token)):
    """Remove/skip a patient from the queue."""
    db = get_db()
    role = current_user.get("role")
    if role not in ["Hospital", "Admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        await db["queue_entries"].update_one(
            {"_id": ObjectId(queue_id)},
            {"$set": {"status": "skipped"}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid queue entry ID")

    return {"success": True, "message": "Patient removed from queue"}
