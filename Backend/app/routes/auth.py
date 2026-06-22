from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from bson import ObjectId
from jose import jwt, JWTError

# Internal Architecture Imports
from app.schemas import UserCreate, UserLogin, UserResponse, PasswordResetConfirm
from app.database import get_db
from app.auth_utils import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication Layer"])

VALID_ROLES = {"Patient", "Doctor", "Hospital", "Admin"}

# 📝 ROUTE 1: USER REGISTRATION (SIGNUP)
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    db = get_db()
    existing_user = await db["users"].find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yeh email ID pehle se registered hai node par."
        )

    # Validate role
    role = user_data.role if user_data.role else "Patient"
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed: {', '.join(VALID_ROLES)}"
        )

    hashed_pwd = hash_password(user_data.password)
    new_user_dict = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pwd,
        "role": role,
        "phone": user_data.phone
    }
    result = await db["users"].insert_one(new_user_dict)
    user_id = str(result.inserted_id)

    # Create role-specific sub-collection records
    if role == "Doctor":
        await db["doctors"].insert_one({
            "user_id": user_id,
            "specialty": "General",
            "qualifications": "",
            "experience_years": 0,
            "bio": "",
            "hospital_id": None,
            "availability": {}
        })
    elif role == "Hospital":
        await db["hospitals"].insert_one({
            "user_id": user_id,
            "address": "",
            "departments": [],
            "facilities": []
        })

    return {
        "success": True,
        "message": f"User architecture node successfully created as {role}!",
        "user_id": user_id
    }

# 🔑 ROUTE 2: USER AUTHENTICATION (LOGIN)
@router.post("/login")
async def login(credentials: UserLogin):
    db = get_db()
    user = await db["users"].find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials (Email ya Password galat hai)"
        )
    role = user.get("role", "Patient")
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"], "role": role})
    return {
        "success": True,
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": role,
            "phone": user.get("phone")
        }
    }

# 🌐 ROUTE 3: GOOGLE LOGIN PIPELINE MAPPING
@router.post("/google-login")
async def google_login(google_data: dict):
    db = get_db()
    email = google_data.get("email")
    name = google_data.get("name")

    if not email:
        raise HTTPException(status_code=400, detail="Google payload invalid: Email missing.")

    user = await db["users"].find_one({"email": email})
    if not user:
        new_google_user = {
            "name": name if name else "Google Operator",
            "email": email,
            "password": "OAUTH_FIREBASE_SECURE_TOKEN_NODE",
            "role": "Patient",
            "phone": None
        }
        result = await db["users"].insert_one(new_google_user)
        user = await db["users"].find_one({"_id": result.inserted_id})

    role = user.get("role", "Patient")
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"], "role": role})
    return {
        "success": True,
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": role,
            "phone": user.get("phone")
        }
    }

# 📬 ROUTE 4: FORGOT PASSWORD (TRIGGER RESET LINK)
@router.post("/forgot-password")
async def forgot_password(payload: dict):
    db = get_db()
    email = payload.get("email")

    user = await db["users"].find_one({"email": email})
    if not user:
        # Security practice: Don't leak if email exists, just say sent
        return {"success": True, "message": "Agar yeh email registered hai, toh reset link bhej diya gaya hai."}

    # Generate temporary 15-minute secure token for reset path
    reset_token = create_access_token(
        data={"sub": str(user["_id"]), "action": "password_reset"},
        expires_delta=timedelta(minutes=15)
    )

    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    print(f"\n📬 [SERVER MAIL SIMULATOR] Link Sent to {email}:\n👉 {reset_link}\n")

    return {
        "success": True,
        "message": "Reset link successfully generated in backend log pipelines.",
        "dev_mock_link": reset_link
    }

# 🔒 ROUTE 5: CONFIRM PASSWORD RESET (UPDATE IN DB)
@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm):
    db = get_db()
    try:
        payload = jwt.decode(data.token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        action = payload.get("action")

        if action != "password_reset" or not user_id:
            raise HTTPException(status_code=400, detail="Invalid token target matrix.")

    except JWTError:
        raise HTTPException(status_code=400, detail="Reset token expired ya corrupted hai.")

    hashed_pwd = hash_password(data.new_password)
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_pwd}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User node not found or identity mismatch.")

    return {"success": True, "message": "Password architecture successfully re-coded!"}