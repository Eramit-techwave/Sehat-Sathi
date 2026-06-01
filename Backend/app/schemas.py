from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# 📝 SIGN UP: Jab naya user register karega
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="User ka poora naam")
    email: EmailStr = Field(..., description="User ki valid email address")
    password: str = Field(..., min_length=6, description="Security phrase ya password (min 6 characters)")

# 🔑 LOGIN: Jab user sign in karega
class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email ID")
    password: str = Field(..., description="Account security password")

# 👤 RESPONSE: Jab backend user ka data wapas frontend ko bhejega
class UserResponse(BaseModel):
    id: str = Field(..., alias="_id", description="MongoDB ki unique Object ID")
    name: str
    email: EmailStr

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# 🔒 PASSWORD RESET: Naya password set karne ke liye validation schema
class PasswordResetConfirm(BaseModel):
    token: str = Field(..., description="Secure reset token supplied via email url")
    new_password: str = Field(..., min_length=6, description="Naya password string")