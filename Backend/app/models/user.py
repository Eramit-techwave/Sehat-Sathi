from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# 1. Base User Schema (Jo signup ke time data chahiye)
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr  # Yeh automatically check karega ki email sahi format me hai ya nahi
    password: str = Field(..., min_length=6)

# 2. User Response Schema (Jo data hum frontend ko wapas bhejenge - isme password nahi hoga)
class UserResponse(BaseModel):
    id: str = Field(..., alias="_id") # MongoDB ki default ID string format me
    name: str
    email: EmailStr
    created_at: datetime
    is_active: bool = True

    # Pydantic ko MongoDB ke BSON data ko handle karne ke liye config
    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "name": "Amit Dubey",
                "email": "amit@example.com",
                "created_at": "2026-05-29T12:00:00"
            }
        }
    }