"""
Notification Routes
===================
In-app notification system. Notifications are created internally by other
route handlers (appointments, admin verification, etc.).
Users can only read/mark their own notifications.
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_db
from app.auth_utils import verify_token

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ─────────────────────────────────────────────────────────────
# INTERNAL UTILITY — called by other routes, not exposed as API
# ─────────────────────────────────────────────────────────────

async def create_notification(
    db,
    user_id: str,
    notif_type: str,
    title: str,
    message: str,
    metadata: dict = None
):
    """
    Internal utility to create a notification for a user.
    Call this from other route handlers — never expose directly.

    Types used across the platform:
    - appointment_booked
    - appointment_confirmed
    - appointment_cancelled
    - appointment_completed
    - verification_approved
    - verification_rejected
    - report_analyzed
    """
    notif = {
        "user_id": user_id,
        "type": notif_type,
        "title": title,
        "message": message,
        "is_read": False,
        "metadata": metadata or {},
        "created_at": datetime.now()
    }
    await db["notifications"].insert_one(notif)


# ─────────────────────────────────────────────────────────────
# FETCH NOTIFICATIONS
# ─────────────────────────────────────────────────────────────

@router.get("/")
async def get_my_notifications(
    limit: int = 30,
    unread_only: bool = False,
    current_user: dict = Depends(verify_token)
):
    """Get current user's notifications, sorted by most recent."""
    db = get_db()
    user_id = current_user.get("sub")

    query = {"user_id": user_id}
    if unread_only:
        query["is_read"] = False

    cursor = db["notifications"].find(query).sort("created_at", -1).limit(limit)
    notifications = await cursor.to_list(length=limit)

    for n in notifications:
        n["id"] = str(n["_id"])
        n.pop("_id", None)
        if isinstance(n.get("created_at"), datetime):
            n["created_at"] = n["created_at"].isoformat()

    # Unread count
    unread_count = await db["notifications"].count_documents({"user_id": user_id, "is_read": False})

    return {
        "notifications": notifications,
        "unread_count": unread_count,
        "total": len(notifications)
    }


@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(verify_token)):
    """Quick endpoint to get just the unread notification count (for bell badge)."""
    db = get_db()
    user_id = current_user.get("sub")
    count = await db["notifications"].count_documents({"user_id": user_id, "is_read": False})
    return {"unread_count": count}


# ─────────────────────────────────────────────────────────────
# MARK AS READ
# ─────────────────────────────────────────────────────────────

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(verify_token)
):
    """Mark a single notification as read."""
    db = get_db()
    user_id = current_user.get("sub")

    try:
        result = await db["notifications"].update_one(
            {"_id": ObjectId(notification_id), "user_id": user_id},
            {"$set": {"is_read": True, "read_at": datetime.now()}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found or access denied")

    return {"success": True, "message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(verify_token)):
    """Mark all of the user's notifications as read."""
    db = get_db()
    user_id = current_user.get("sub")

    result = await db["notifications"].update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.now()}}
    )

    return {
        "success": True,
        "message": f"Marked {result.modified_count} notification(s) as read"
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(verify_token)
):
    """Delete a single notification."""
    db = get_db()
    user_id = current_user.get("sub")

    try:
        result = await db["notifications"].delete_one(
            {"_id": ObjectId(notification_id), "user_id": user_id}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found or access denied")

    return {"success": True, "message": "Notification deleted"}
