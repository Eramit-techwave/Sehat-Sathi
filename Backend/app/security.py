import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from app.config import settings

# 1. Passlib configuration password hashing ke liye
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password utility functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# 2. JWT Token Utility Function
# Yeh function user ka data lekar ek temporary encrypted token generate karega
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    # Agar expire time nahi diya, toh default 30 minutes ka time set hoga
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    
    # Token ke andar expiration time (exp) ko add kar rahe hain
    to_encode.update({"exp": expire})
    
    # JWT token code encode kar rahe hain Secret Key aur Algorithm ka use karke
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
    
    return encoded_jwt