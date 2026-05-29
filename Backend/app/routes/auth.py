from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate
# Security utilities ko import kar rahe hain
from app.security import get_password_hash, verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Mock Database testing ke liye (Global list)
users_db = []

# 1. SIGNUP ENDPOINT
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    for user in users_db:
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        "_id": f"mock_id_{len(users_db) + 1}",
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
    }
    
    users_db.append(new_user)
    return {
        "status": "success",
        "message": "User registered successfully with encrypted password!",
        "user": {
            "id": new_user["_id"],
            "name": new_user["name"],
            "email": new_user["email"]
        }
    }

# 2. Naya Addition: LOGIN ENDPOINT (POST Request)
@router.post("/login")
async def login(login_data: UserCreate): # Testing ke liye hum UserCreate schema hi use kar rahe hain
    user_found = None
    
    # Database me email dhoondh rahe hain
    for user in users_db:
        if user["email"] == login_data.email:
            user_found = user
            break
            
    # Agar email nahi mila, toh 401 Unauthorized error bhejenge
    if not user_found:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Password verify kar rahe hain (Plain input vs Hashed DB password)
    if not verify_password(login_data.password, user_found["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Agar dono sahi hain, toh JWT Token generate kar rahe hain
    token_data = {"sub": user_found["email"], "user_name": user_found["name"]}
    access_token = create_access_token(data=token_data)
    
    return {
        "status": "success",
        "message": "Login successful!",
        "access_token": access_token,
        "token_type": "bearer"
    }