from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ─────────────────────────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────────────────────────

# 📝 SIGN UP
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="User ka poora naam")
    email: EmailStr = Field(..., description="User ki valid email address")
    password: str = Field(..., min_length=6, description="Security phrase ya password (min 6 characters)")
    role: str = Field(default="Patient", description="User role: Patient, Doctor, Hospital only (Admin not allowed via API)")
    phone: Optional[str] = Field(None, description="Contact number")
    # Doctor-specific optional fields
    medical_reg_number: Optional[str] = Field(None, description="Medical Council Registration Number (Doctor only)")
    qualifications: Optional[str] = Field(None, description="Degrees and qualifications (Doctor only)")
    # Hospital-specific optional fields
    registration_number: Optional[str] = Field(None, description="Hospital Registration Number (Hospital only)")

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
    verification_status: Optional[str] = "approved"

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

# 🔒 PASSWORD RESET
class PasswordResetConfirm(BaseModel):
    token: str = Field(..., description="Secure reset token supplied via email url")
    new_password: str = Field(..., min_length=6, description="Naya password string")


# ─────────────────────────────────────────────────────────────
# APPOINTMENT SCHEMAS
# ─────────────────────────────────────────────────────────────

# 📅 APPOINTMENTS
class AppointmentCreate(BaseModel):
    doctor_id: str
    hospital_id: Optional[str] = None
    date: str = Field(..., description="YYYY-MM-DD format")
    time_slot: str = Field(..., description="HH:MM AM/PM format")
    reason: Optional[str] = Field(None, description="Reason for appointment")

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
    reason: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# ─────────────────────────────────────────────────────────────
# PROFILE SCHEMAS
# ─────────────────────────────────────────────────────────────

# 👤 PROFILE UPDATE
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bloodType: Optional[str] = None
    age: Optional[str] = None
    location: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# DOCTOR SCHEMAS
# ─────────────────────────────────────────────────────────────

# 🏥 Doctor-Hospital Association (for multi-hospital support)
class DoctorHospitalAssociation(BaseModel):
    hospital_id: str = Field(..., description="Hospital user_id")
    hospital_name: Optional[str] = Field(None, description="Human-readable name (cached)")
    role: Optional[str] = Field(None, description="e.g. Visiting Consultant, Resident")
    is_primary: bool = Field(default=False, description="Primary workplace")

# 👨‍⚕️ DOCTOR PROFILE
class DoctorProfile(BaseModel):
    specialty: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    # Legacy single hospital_id (kept for backward compat)
    hospital_id: Optional[str] = None
    # NEW: Multi-hospital associations
    hospital_associations: Optional[List[DoctorHospitalAssociation]] = None
    # NEW: Practice type
    practice_type: Optional[str] = Field(
        None,
        description="'independent', 'hospital_based', or 'multi_hospital'"
    )
    medical_reg_number: Optional[str] = None
    license_details: Optional[str] = None
    consultation_fee: Optional[int] = None

# 🗓️ DOCTOR AVAILABILITY
# Structure: { "Monday": ["09:00 AM", "10:00 AM"], "Tuesday": [...], ... }
class DoctorAvailability(BaseModel):
    availability: Dict[str, List[str]] = Field(
        default={},
        description="Weekly availability: day -> list of time slots"
    )


# ─────────────────────────────────────────────────────────────
# HOSPITAL SCHEMAS
# ─────────────────────────────────────────────────────────────

# 🏥 HOSPITAL PROFILE
class HospitalProfile(BaseModel):
    address: Optional[str] = None
    departments: Optional[List[str]] = None
    facilities: Optional[List[str]] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    registration_number: Optional[str] = None
    bed_counts: Optional[Dict[str, int]] = None

class BedAvailabilityUpdate(BaseModel):
    general: Optional[bool] = None
    icu: Optional[bool] = None
    emergency: Optional[bool] = None

class HospitalAnnouncement(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)


# ─────────────────────────────────────────────────────────────
# ADMIN SCHEMAS
# ─────────────────────────────────────────────────────────────

class AdminApprovalAction(BaseModel):
    action: str = Field(..., description="'approve' or 'reject'")
    reason: Optional[str] = Field(None, description="Required when action is 'reject'")


# ─────────────────────────────────────────────────────────────
# NOTIFICATION SCHEMAS
# ─────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    is_read: bool = False
    metadata: Optional[Dict[str, Any]] = None
    created_at: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True