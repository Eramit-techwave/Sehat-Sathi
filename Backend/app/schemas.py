from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# 📝 SIGN UP
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="User ka poora naam")
    email: EmailStr = Field(..., description="User ki valid email address")
    password: str = Field(..., min_length=6, description="Security phrase ya password (min 6 characters)")
    role: str = Field(default="Patient", description="User role: Patient, Doctor, Hospital, Admin")
    phone: Optional[str] = Field(None, description="Contact number")

# 🔑 LOGIN
class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email ID")
    password: str = Field(..., description="Account security password")

# 👤 RESPONSE
class UserResponse(BaseModel):
    id: str = Field(..., alias="_id", description="MongoDB ki unique Object ID")
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    bloodType: Optional[str] = None
    age: Optional[str] = None
    location: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# 🔒 PASSWORD RESET
class PasswordResetConfirm(BaseModel):
    token: str = Field(..., description="Secure reset token supplied via email url")
    new_password: str = Field(..., min_length=6, description="Naya password string")

# 📅 APPOINTMENTS
class AppointmentCreate(BaseModel):
    doctor_id: str
    hospital_id: Optional[str] = None
    date: str = Field(..., description="YYYY-MM-DD format")
    time_slot: str = Field(..., description="HH:MM AM/PM format")

class AppointmentReschedule(BaseModel):
    new_date: str = Field(..., description="New date in YYYY-MM-DD format")
    new_time_slot: str = Field(..., description="New time slot")

class AppointmentResponse(BaseModel):
    id: str = Field(..., alias="_id")
    patient_id: str
    doctor_id: str
    hospital_id: Optional[str] = None
    date: str
    time_slot: str
    status: str = "Pending"
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# 👤 PROFILE UPDATE
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bloodType: Optional[str] = None
    age: Optional[str] = None
    location: Optional[str] = None

# 👨‍⚕️ DOCTOR PROFILE
class DoctorProfile(BaseModel):
    specialty: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    hospital_id: Optional[str] = None

# 🗓️ DOCTOR AVAILABILITY
# Structure: { "Monday": ["09:00 AM", "10:00 AM"], "Tuesday": [...], ... }
class DoctorAvailability(BaseModel):
    availability: Dict[str, List[str]] = Field(
        default={},
        description="Weekly availability: day -> list of time slots"
    )

# 🏥 HOSPITAL PROFILE
class HospitalProfile(BaseModel):
    address: Optional[str] = None
    departments: Optional[List[str]] = None
    facilities: Optional[List[str]] = None
    phone: Optional[str] = None
    website: Optional[str] = None