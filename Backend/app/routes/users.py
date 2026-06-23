from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

# Directory to store profile photos (reuses existing stored_reports parent)
PROFILE_PHOTOS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "stored_reports", "profile_photos"
)
os.makedirs(PROFILE_PHOTOS_DIR, exist_ok=True)


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


@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token)
):
    """Upload or update profile photo for any user type (Patient, Doctor, Hospital)."""
    db = get_db()
    user_id = current_user.get("sub")

    # Validate file type
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, or WebP images are allowed."
        )

    # Read file and check size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the 5MB limit."
        )

    # Determine extension from content_type
    ext_map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }
    ext = ext_map.get(file.content_type, ".jpg")

    # Save file: named by user_id for easy lookup/replacement
    filename = f"{user_id}{ext}"
    file_path = os.path.join(PROFILE_PHOTOS_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Store the URL reference in the user document
    photo_url = f"/static/photos/{filename}"
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"profile_photo_url": photo_url}}
    )

    return {
        "success": True,
        "message": "Profile photo uploaded successfully.",
        "profile_photo_url": photo_url
    }


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
