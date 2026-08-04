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
    doctor_name: Optional[str] = Field(None, description="Doctor full name")
    doctor_specialty: Optional[str] = Field(None, description="Doctor specialization")
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = Field(None, description="Hospital or clinic name")
    patient_name: Optional[str] = Field(None, description="Patient full name")
    date: str = Field(..., description="YYYY-MM-DD format")
    time_slot: str = Field(..., description="HH:MM AM/PM format")
    reason: Optional[str] = Field(None, description="Reason for appointment")
    payment_method: Optional[str] = Field("cash", description="'upi' | 'card' | 'netbanking' | 'cash'")
    payment_status: Optional[str] = Field("Pending", description="'Paid' | 'Pending' | 'Cash at Clinic'")
    amount: Optional[float] = Field(0.0, description="Amount paid or payable in INR")
    transaction_id: Optional[str] = Field(None, description="Transaction ID")

class AppointmentReschedule(BaseModel):
    new_date: str = Field(..., description="New date in YYYY-MM-DD format")
    new_time_slot: str = Field(..., description="New time slot")

class AppointmentStatusUpdate(BaseModel):
    status: str = Field(..., description="'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled'")
    new_date: Optional[str] = Field(None, description="Optional new date in YYYY-MM-DD format")
    new_time_slot: Optional[str] = Field(None, description="Optional new time slot")
    doctor_note: Optional[str] = Field(None, description="Note or instructions for patient")

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
    payment_method: Optional[str] = "cash"
    payment_status: Optional[str] = "Pending"
    amount: Optional[float] = 0.0
    transaction_id: Optional[str] = None

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
    # ── LOCATION FIELDS (Phase 3 — additive, fully optional) ─────────
    clinic_address: Optional[str] = Field(None, description="Full clinic/hospital address")
    clinic_city: Optional[str] = Field(None, description="City where clinic is located")
    clinic_state: Optional[str] = Field(None, description="State")
    clinic_pincode: Optional[str] = Field(None, description="PIN / ZIP code")
    clinic_lat: Optional[float] = Field(None, description="Latitude for Google Maps")
    clinic_lng: Optional[float] = Field(None, description="Longitude for Google Maps")
    # ── ADDITIONAL PROFILE FIELDS ────────────────────────────────────
    languages: Optional[List[str]] = Field(None, description="Languages spoken by doctor")
    gender: Optional[str] = Field(None, description="'Male' | 'Female' | 'Other'")
    online_status: Optional[str] = Field(None, description="'online' | 'offline' | 'busy'")

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
    # ── LOCATION FIELDS (Phase 3 — additive, fully optional) ─────────
    city: Optional[str] = Field(None, description="Hospital city")
    state: Optional[str] = Field(None, description="Hospital state")
    pincode: Optional[str] = Field(None, description="PIN / ZIP code")
    lat: Optional[float] = Field(None, description="Latitude for Google Maps")
    lng: Optional[float] = Field(None, description="Longitude for Google Maps")
    opening_hours: Optional[str] = Field(None, description="e.g. Mon-Sat 8AM-8PM, Sun 9AM-5PM")
    emergency_phone: Optional[str] = Field(None, description="Direct emergency contact number")

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


# ─────────────────────────────────────────────────────────────
# HOSPITAL ROOM BOOKING SCHEMAS
# ─────────────────────────────────────────────────────────────

class RoomBookingCreate(BaseModel):
    hospital_id: str = Field(..., description="Target Hospital user_id")
    room_type: str = Field(..., description="'General Ward' | 'Semi-Private Room' | 'Private Deluxe AC Room' | 'ICU / Critical Care' | 'Super-Specialty Suite'")
    daily_rate: float = Field(..., gt=0, description="Per day room tariff in INR")
    duration_days: int = Field(..., gt=0, description="Expected stay duration in days")
    admission_date: str = Field(..., description="YYYY-MM-DD format")
    patient_name: str = Field(..., description="Full name of patient to be admitted")
    patient_age: str = Field(..., description="Age of patient")
    patient_gender: str = Field(..., description="Gender: Male | Female | Other")
    contact_phone: str = Field(..., description="Primary contact number")
    attendant_name: Optional[str] = Field(None, description="Attendant / Emergency contact name")
    attendant_relation: Optional[str] = Field(None, description="Relation to patient")
    reason: Optional[str] = Field(None, description="Reason for admission / diagnosis")
    payment_method: Optional[str] = Field("UPI", description="'UPI' | 'Card' | 'NetBanking' | 'Cash'")
    payment_status: Optional[str] = Field("Paid", description="'Paid' | 'Pay at Hospital'")
    transaction_id: Optional[str] = Field(None, description="Transaction ID for room booking")


# ─────────────────────────────────────────────────────────────
# ENHANCED BLOOD DONOR & REQUEST SCHEMAS
# ─────────────────────────────────────────────────────────────

class EnhancedDonorRegistration(BaseModel):
    fullName: str = Field(..., description="Full name of donor")
    phone: str = Field(..., description="Contact mobile number")
    bloodGroup: str = Field(..., description="Blood Group: A+, A-, B+, B-, AB+, AB-, O+, O-")
    age: str = Field(..., description="Age in years")
    gender: Optional[str] = Field("Other", description="Male | Female | Other")
    weight: Optional[str] = Field(None, description="Weight in kg")
    city: str = Field(..., description="City name")
    state: str = Field(..., description="State name")
    address: str = Field(..., description="Full residential address with street and area")
    pincode: Optional[str] = Field(None, description="PIN code")
    lastDonation: Optional[str] = Field(None, description="Last blood donation date or 'Never'")
    # Medical & Health Screening Questionnaire
    consumes_alcohol: bool = Field(default=False, description="Does donor consume alcohol?")
    alcohol_frequency: Optional[str] = Field(None, description="Frequency: Daily | Weekly | Socially | Rarely | Never")
    last_alcohol_consumed: Optional[str] = Field(None, description="When was alcohol last consumed? e.g., '3 days ago'")
    has_current_illness: bool = Field(default=False, description="Any current illness or symptoms?")
    current_illnesses: Optional[str] = Field(None, description="Details of current illnesses/symptoms or medications")
    taking_medications: bool = Field(default=False, description="Taking any regular prescription medicines?")
    medication_details: Optional[str] = Field(None, description="Details of current medications")
    has_past_major_illness: bool = Field(default=False, description="History of past major illnesses?")
    past_medical_history: Optional[str] = Field(None, description="Detailed history of past major illnesses: what illness, when occurred, duration, treatment details")
    recent_surgery_or_vaccination: bool = Field(default=False, description="Any recent surgery, tattoo, or vaccination in last 6 months?")


class EnhancedBloodRequest(BaseModel):
    patientName: str = Field(..., description="Patient requiring blood")
    patientAge: Optional[str] = Field(None, description="Patient age")
    patientGender: Optional[str] = Field(None, description="Patient gender")
    bloodGroup: str = Field(..., description="Target blood group")
    unitsRequired: Optional[int] = Field(default=1, description="Number of units required")
    hospital: str = Field(..., description="Hospital name & address")
    city: str = Field(..., description="City")
    urgency: str = Field(..., description="Immediate (Emergency) | Within 24 hrs | Scheduled")
    requesterName: str = Field(..., description="Full name of person requesting")
    requesterPhone: str = Field(..., description="Contact phone number")
    requesterAddress: str = Field(..., description="Full address of requester/hospital")
    doctorInCharge: Optional[str] = Field(None, description="Attending Doctor name")
    roomNumber: Optional[str] = Field(None, description="Hospital Ward / Room Number")
    reasonForBlood: Optional[str] = Field(None, description="Medical reason / diagnosis requiring blood")
    patientMedicalHistory: Optional[str] = Field(None, description="Patient's medical history & past conditions")