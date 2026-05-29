from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate
# 1. Naya Import: Security file se hashing function ko import kar rahe hain
from app.security import get_password_hash

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Mock Database testing ke liye
users_db = []

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    # Check kar rahe hain ki email pehle se exist toh nahi karta
    for user in users_db:
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # 2. Naya Addition: Plain password ko hash (encrypt) kar rahe hain
    hashed_password = get_password_hash(user_data.password)
    
    # User ka data dictionary me save kar rahe hain (With Hashed Password)
    new_user = {
        "_id": f"mock_id_{len(users_db) + 1}",
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,  # Ab plain password ki jagah safe hash save hoga!
    }
    
    users_db.append(new_user)
    
    # Testing ke liye hum terminal par print karke dekhenge ki hash kaisa dikhta hai
    print(f"🔒 New User Registered! Plain: {user_data.password} -> Hash: {hashed_password}")
    
    return {
        "status": "success",
        "message": "User registered successfully with encrypted password!",
        "user": {
            "id": new_user["_id"],
            "name": new_user["name"],
            "email": new_user["email"]
        }
    }