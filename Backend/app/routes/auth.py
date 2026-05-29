from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate
from app.security import get_password_hash, verify_password, create_access_token
# 1. Naya Import: database.py se direct db reference ko import kar rahe hain
from app.database import db
from datetime import datetime

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# 2. SIGNUP ENDPOINT (Real MongoDB Integration)
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    # MongoDB ke 'users' collection ko access kar rahe hain
    users_collection = db["users"]
    
    # Real DB Query: Check kar rahe hain ki kya email pehle se exist karta hai
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Password ko hash kar rahe hain
    hashed_password = get_password_hash(user_data.password)
    
    # MongoDB me save karne ke liye document taiyar kar rahe hain
    new_user_document = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    # Real DB Query: Document ko cloud database me insert kar rahe hain
    result = await users_collection.insert_one(new_user_document)
    
    return {
        "status": "success",
        "message": "User registered successfully in Cloud Database!",
        "user_id": str(result.inserted_id)  # MongoDB ki unique Object ID wapas bhej rahe hain
    }

# 3. LOGIN ENDPOINT (Real MongoDB Integration)
@router.post("/login")
async def login(login_data: UserCreate):
    users_collection = db["users"]
    
    # Real DB Query: User ko uske email se dhoondh rahe hain
    user_found = await users_collection.find_one({"email": login_data.email})
    
    if not user_found:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Password verification
    if not verify_password(login_data.password, user_found["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Token generate kar rahe hain
    token_data = {"sub": user_found["email"], "user_name": user_found["name"]}
    access_token = create_access_token(data=token_data)
    
    return {
        "status": "success",
        "message": "Login successful!",
        "access_token": access_token,
        "token_type": "bearer"
    }