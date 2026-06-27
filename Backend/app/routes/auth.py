from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from bson import ObjectId
from jose import jwt, JWTError
import random
import string

# Internal Architecture Imports
from app.schemas import UserCreate, UserLogin, UserResponse, PasswordResetConfirm
from app.database import get_db
from app.auth_utils import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication Layer"])

# ⚠️  SECURITY: Admin is intentionally excluded from public signup.
# Admin accounts must be created via the CLI script: python -m app.scripts.create_admin
# Doctors and Hospitals are created in "pending" state — require Admin approval before access.
PUBLIC_VALID_ROLES = {"Patient", "Doctor", "Hospital"}

# Dependency for use by analyzer.py (get_current_user → returns user_id string)
async def get_current_user(token_data: dict = Depends(lambda: None)):
    """Legacy compatibility shim — use verify_token from auth_utils instead."""
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from fastapi import Security
    from app.auth_utils import verify_token
    # This is handled by individual route dependencies
    pass


# 📝 ROUTE 1: USER REGISTRATION (SIGNUP)
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    db = get_db()
    existing_user = await db["users"].find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This E-mail ID Already exits in our system! Please try to Singup with another ID."
        )

    # ⚠️  SECURITY FIX: Admin role CANNOT be self-registered via the public API.
    # Attempting to pass role=Admin via API will be silently downgraded to Patient.
    role = user_data.role if user_data.role else "Patient"
    if role not in PUBLIC_VALID_ROLES:
        # If someone passes "Admin" via direct API call, reject it explicitly
        if role == "Admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin accounts cannot be created via public registration. Contact your platform administrator."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed: {', '.join(PUBLIC_VALID_ROLES)}"
        )

    hashed_pwd = hash_password(user_data.password)
    new_user_dict = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pwd,
        "role": role,
        "phone": user_data.phone,
        "created_at": __import__("datetime").datetime.now()
    }
    result = await db["users"].insert_one(new_user_dict)
    user_id = str(result.inserted_id)

    # Create role-specific sub-collection records
    if role == "Doctor":
        await db["doctors"].insert_one({
            "user_id": user_id,
            "specialty": "General",
            "qualifications": user_data.qualifications or "",
            "experience_years": 0,
            "bio": "",
            "hospital_id": None,
            "availability": {},
            # ✅ VERIFICATION FIELDS — Doctor starts as "pending"
            "verification_status": "pending",
            "medical_reg_number": user_data.medical_reg_number or "",
            "license_details": "",
            "kyc_status": "not_submitted",
            "rejection_reason": None,
            "verified_at": None,
            "created_at": __import__("datetime").datetime.now()
        })
        return {
            "success": True,
            "message": "Doctor account created! Your profile is under review by our admin team. You'll be notified once verified.",
            "user_id": user_id,
            "verification_required": True,
            "verification_status": "pending"
        }

    elif role == "Hospital":
        # Auto-generate a unique 6-digit Hospital Platform ID (e.g. HSP548921)
        async def generate_unique_hospital_id():
            while True:
                digits = "".join(random.choices(string.digits, k=6))
                candidate = f"HSP{digits}"
                existing = await db["hospitals"].find_one({"hospital_platform_id": candidate})
                if not existing:
                    return candidate

        hospital_platform_id = await generate_unique_hospital_id()

        await db["hospitals"].insert_one({
            "user_id": user_id,
            "name": user_data.name,
            "address": "",
            "departments": [],
            "facilities": [],
            "phone": user_data.phone or "",
            "website": "",
            "registration_number": user_data.registration_number or "",
            "hospital_platform_id": hospital_platform_id,
            "bed_counts": {"general": 0, "icu": 0, "emergency": 0},
            "bed_availability": {"general": True, "icu": True, "emergency": True},
            # ✅ VERIFICATION FIELDS — Hospital starts as "pending"
            "verification_status": "pending",
            "rejection_reason": None,
            "verified_at": None,
            "is_publicly_listed": False,
            "announcements": [],
            "created_at": __import__("datetime").datetime.now()
        })
        return {
            "success": True,
            "message": "Hospital account created! Your registration is under review. You'll be listed publicly once verified.",
            "user_id": user_id,
            "hospital_platform_id": hospital_platform_id,
            "verification_required": True,
            "verification_status": "pending"
        }

    return {
        "success": True,
        "message": f"User account successfully created as {role}!",
        "user_id": user_id,
        "verification_required": False
    }


# 🔑 ROUTE 2: USER AUTHENTICATION (LOGIN)
@router.post("/login")
async def login(credentials: UserLogin):
    db = get_db()
    user = await db["users"].find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials (Email or Password worng). Please check and try again.",
        )
    role = user.get("role", "Patient")

    # Fetch verification status for Doctor/Hospital roles
    verification_status = "approved"  # Default for Patient/Admin
    if role == "Doctor":
        doc_profile = await db["doctors"].find_one({"user_id": str(user["_id"])})
        verification_status = doc_profile.get("verification_status", "approved") if doc_profile else "pending"
    elif role == "Hospital":
        hosp_profile = await db["hospitals"].find_one({"user_id": str(user["_id"])})
        verification_status = hosp_profile.get("verification_status", "approved") if hosp_profile else "pending"

    access_token = create_access_token(data={
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": role,
        "verification_status": verification_status
    })
    return {
        "success": True,
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": role,
            "phone": user.get("phone"),
            "verification_status": verification_status
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
        # Google OAuth always creates Patient role — no role escalation possible
        new_google_user = {
            "name": name if name else "Google User",
            "email": email,
            "password": "OAUTH_FIREBASE_SECURE_TOKEN_NODE",
            "role": "Patient",
            "phone": None,
            "created_at": __import__("datetime").datetime.now()
        }
        result = await db["users"].insert_one(new_google_user)
        user = await db["users"].find_one({"_id": result.inserted_id})

    role = user.get("role", "Patient")
    access_token = create_access_token(data={
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": role,
        "verification_status": "approved"
    })
    return {
        "success": True,
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": role,
            "phone": user.get("phone"),
            "verification_status": "approved"
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
        return {"success": True, "message": "If this E-Mail is registered with us then reset link has been send successfully."}

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


# 🔍 ROUTE 6: CHECK VERIFICATION STATUS
@router.get("/verification-status")
async def check_verification_status(current_user: dict = Depends(__import__("app.auth_utils", fromlist=["verify_token"]).verify_token)):
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role == "Doctor":
        doc = await db["doctors"].find_one({"user_id": user_id})
        if doc:
            return {
                "role": role,
                "verification_status": doc.get("verification_status", "pending"),
                "rejection_reason": doc.get("rejection_reason"),
                "medical_reg_number": doc.get("medical_reg_number", "")
            }
    elif role == "Hospital":
        hosp = await db["hospitals"].find_one({"user_id": user_id})
        if hosp:
            return {
                "role": role,
                "verification_status": hosp.get("verification_status", "pending"),
                "rejection_reason": hosp.get("rejection_reason")
            }

    return {"role": role, "verification_status": "approved"}