"""
Sehat-Sathi V2 Pydantic Schemas
================================
All new V2 models are defined here.
V1 schemas.py is intentionally untouched for backward compatibility.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# PRESCRIPTION SCHEMAS
# ─────────────────────────────────────────────────────────────

class MedicineItem(BaseModel):
    """A single medicine entry on a prescription."""
    name: str = Field(..., min_length=1, description="Medicine name")
    dosage: str = Field(..., description="Dosage e.g. '500mg', '10ml'")
    frequency: str = Field(..., description="e.g. 'Twice a day', 'Every 8 hours'")
    duration: str = Field(..., description="e.g. '5 days', '1 week'")
    instructions: Optional[str] = Field(None, description="Special instructions e.g. 'After meals'")


class PrescriptionCreate(BaseModel):
    """Doctor creates a prescription for a patient."""
    patient_id: str = Field(..., description="Patient's user_id")
    appointment_id: Optional[str] = Field(None, description="Linked appointment (optional)")
    diagnosis: str = Field(..., min_length=2, description="Primary diagnosis")
    medicines: List[MedicineItem] = Field(default=[], description="List of prescribed medicines")
    notes: Optional[str] = Field(None, description="Additional clinical notes")
    follow_up_date: Optional[str] = Field(None, description="Suggested follow-up date YYYY-MM-DD")
    status: str = Field(default="draft", description="'draft' or 'finalized'")


class PrescriptionResponse(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    appointment_id: Optional[str] = None
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    diagnosis: str
    medicines: List[MedicineItem] = []
    notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    status: str = "draft"
    created_at: str
    finalized_at: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# ─────────────────────────────────────────────────────────────
# FOLLOW-UP SCHEMAS
# ─────────────────────────────────────────────────────────────

class FollowUpCreate(BaseModel):
    """Doctor creates a follow-up task for a patient."""
    patient_id: str = Field(..., description="Patient's user_id")
    prescription_id: Optional[str] = Field(None, description="Linked prescription (optional)")
    appointment_id: Optional[str] = Field(None, description="Linked appointment (optional)")
    type: str = Field(
        default="review",
        description="'review' | 'medicine' | 'test' | 'general'"
    )
    title: str = Field(..., min_length=3, description="Short description of the follow-up")
    description: Optional[str] = Field(None, description="Detailed instructions")
    due_date: str = Field(..., description="Due date in YYYY-MM-DD format")
    due_time: Optional[str] = Field(None, description="Optional time e.g. '10:00 AM'")


class FollowUpResponse(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    prescription_id: Optional[str] = None
    appointment_id: Optional[str] = None
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    type: str
    title: str
    description: Optional[str] = None
    due_date: str
    due_time: Optional[str] = None
    status: str = "pending"
    created_at: str
    completed_at: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


# ─────────────────────────────────────────────────────────────
# QUEUE MANAGEMENT SCHEMAS
# ─────────────────────────────────────────────────────────────

class QueueEntryCreate(BaseModel):
    """Hospital adds a patient to the queue."""
    patient_id: str
    department: str = Field(..., description="e.g. 'Cardiology', 'OPD'")
    appointment_id: Optional[str] = None
    priority: str = Field(default="normal", description="'normal' | 'urgent' | 'emergency'")
    notes: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# LAB ORDER SCHEMAS
# ─────────────────────────────────────────────────────────────

class LabTestItem(BaseModel):
    test_name: str
    instructions: Optional[str] = None
    fasting_required: bool = False


class LabOrderCreate(BaseModel):
    """Doctor creates a lab test order for a patient."""
    patient_id: str
    prescription_id: Optional[str] = None
    tests: List[LabTestItem] = Field(..., min_length=1)
    urgency: str = Field(default="routine", description="'routine' | 'urgent' | 'stat'")
    notes: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# REFERRAL SCHEMAS
# ─────────────────────────────────────────────────────────────

class ReferralCreate(BaseModel):
    """Doctor refers patient to another specialist."""
    patient_id: str
    referred_to_doctor_id: str = Field(..., description="Target specialist's user_id")
    reason: str = Field(..., min_length=5, description="Reason for referral")
    clinical_summary: Optional[str] = Field(None, description="Summary of patient's condition")
    urgency: str = Field(default="routine", description="'routine' | 'urgent' | 'emergency'")
    include_reports: bool = Field(default=True, description="Share patient's recent reports")
    include_prescriptions: bool = Field(default=True, description="Share recent prescriptions")
    appointment_id: Optional[str] = None
