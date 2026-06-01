from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from bson import ObjectId

# Internal Architecture Imports
from app.schemas import UserCreate, UserLogin, UserResponse
from app.database import get_db # 🌟 Changed direct global import to instance fetcher method
from app.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication Layer"])

# 📝 ROUTE 1: USER REGISTRATION (SIGNUP)
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    # 🌟 Direct high-availability reference instantiation to avoid NoneType crash
    db = get_db()
    
    # 1. Check karna ki kya email database me pehle se registered toh nahi hai
    existing_user = await db["users"].find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yeh email ID pehle se registered hai node par."
        )
        
    # 2. Plain password ko secure hash me convert karna
    hashed_pwd = hash_password(user_data.password)
    
    # 3. Database me insert karne ke liye document dictionary banana
    new_user_dict = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pwd
    }
    
    # 4. Data insert karna MongoDB Cloud Atlas collection me
    result = await db["users"].insert_one(new_user_dict)
    
    # 5. Response wapas bhejna frontend ko
    return {
        "success": True,
        "message": "User architecture node successfully created!",
        "user_id": str(result.inserted_id)
    }

# 🔑 ROUTE 2: USER AUTHENTICATION (LOGIN)
@router.post("/login")
async def login(credentials: UserLogin):
    # 🌟 Direct instance initialization
    db = get_db()
    
    # 1. User ko dhoondna uski email ID se
    user = await db["users"].find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials (Email galat hai)"
        )
        
    # 2. Password match check karna
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials (Password galat hai)"
        )
        
    # 3. Successful match par secure access token generate karna
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"]})
    
    # 4. Token aur user info wapas frontend ko supply karna
    return {
        "success": True,
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    }

# 🌐 NEW ROUTE: REAL FIREBASE GOOGLE LOGIN PIPELINE MAPPING
@router.post("/google-login")
async def google_login(google_data: dict):
    # 🌟 Direct high-availability database hook fetch
    db = get_db()
    
    email = google_data.get("email")
    name = google_data.get("name")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google payload invalid: Email missing from handshake vector."
        )

    # 1. Check karna ki kya yeh Google user hamare MongoDB cloud me pehle se exist karta hai
    user = await db["users"].find_one({"email": email})
    
    # 2. Agar user naya hai, toh direct dynamic sign up cluster trace karke record create karenge
    if not user:
        new_google_user = {
            "name": name if name else "Google Operator",
            "email": email,
            "password": "OAUTH_FIREBASE_SECURE_TOKEN_NODE" # Explicit flag for non-password external auth users
        }
        result = await db["users"].insert_one(new_google_user)
        user = await db["users"].find_one({"_id": result.inserted_id})
        
    # 3. Successful identification par system-wide valid JWT access token supply karna
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"]})
    
    # 4. Response pipeline pass to frontend state manager
    return {
        "success": True,
        "token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    }