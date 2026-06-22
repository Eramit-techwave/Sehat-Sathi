from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/users", tags=["Users"])


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    age: Optional[str] = None
    bloodType: Optional[str] = None
    website: Optional[str] = None
    departments: Optional[List[str]] = None
    facilities: Optional[List[str]] = None


@router.get("/profile")
async def get_my_profile(current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.pop("password", None)
    user["id"] = str(user["_id"])
    user.pop("_id", None)

    return user


@router.put("/profile")
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    update_dict = {k: v for k, v in profile_data.model_dump().items() if v is not None}

    if not update_dict:
        return {"success": True, "message": "No changes to update"}

    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "message": "Profile updated successfully"}


@router.get("/all")
async def get_all_users(current_user: dict = Depends(verify_token)):
    """Admin-only: list all users"""
    db = get_db()
    role = current_user.get("role")
    if role != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    cursor = db["users"].find({})
    users = await cursor.to_list(length=500)
    for u in users:
        u.pop("password", None)
        u["id"] = str(u["_id"])
        u.pop("_id", None)
    return users
