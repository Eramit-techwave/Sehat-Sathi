from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.user import UserCreate
from app.security import get_password_hash, verify_password, create_access_token
from app.config import settings 
from app.database import get_db # 🎯 Global variable 'db' hata kar dynamic function import kiya
from datetime import datetime
import jwt

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 🔐 MIDDLEWARE FUNCTION
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials, please login again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        #payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        user_email: str = payload.get("sub")
        if user_email is None:
            raise credentials_exception
        return user_email
    except jwt.PyJWTError:
        raise credentials_exception


# 1. SIGNUP ENDPOINT
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    db = get_db() # 🎯 Dynamic fetch
    users_collection = db["users"]
    
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user_document = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(new_user_document)
    
    return {
        "status": "success",
        "message": "User registered successfully in Cloud Database!",
        "user_id": str(result.inserted_id)
    }


# 2. LOGIN ENDPOINT (Robust Function Integration)
@router.post("/login")
async def login(login_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db() # 🎯 Fixed: Ab ye kabhi 'NoneType' nahi dega!
    users_collection = db["users"]
    
    user_found = await users_collection.find_one({"email": login_data.username})
    
    if not user_found or not verify_password(login_data.password, user_found["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    token_data = {"sub": user_found["email"], "user_name": user_found["name"]}
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }