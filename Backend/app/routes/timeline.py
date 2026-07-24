"""
Workflow Timeline — Sehat-Sathi V2
====================================
Aggregates a patient's complete medical history into one
chronological event stream:
  - Appointments
  - Medical Reports
  - Prescriptions
  - Follow-ups

Returns events sorted newest-first with a unified schema.
Doctors can view a patient's timeline if they have an
existing appointment relationship.
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_db
from app.auth_utils import verify_token

router = APIRouter(prefix="/timeline", tags=["V2 — Workflow Timeline"])


def _safe_dt_str(value) -> str:
    """Safely convert datetime or string to ISO string."""
    if isinstance(value, datetime):
        return value.isoformat()
    if value:
        return str(value)
    return ""


async def _build_timeline(db, patient_id: str) -> list:
    """
    Core aggregation function. Merges all event types into
    a single chronologically sorted event list.
    """
    events = []

    # ── 1. APPOINTMENTS ──────────────────────────────────────
    cursor = db["appointments"].find({"patient_id": patient_id}).sort("date", -1)
    appointments = await cursor.to_list(length=500)
    for apt in appointments:
        # Resolve doctor name
        doctor_name = apt.get("doctor_name", "")
        if not doctor_name:
            try:
                doc = await db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
                doctor_name = doc.get("name", "Doctor") if doc else "Doctor"
            except Exception:
                doctor_name = "Doctor"

        events.append({
            "event_type": "appointment",
            "event_id": str(apt["_id"]),
            "date": apt.get("date", ""),
            "time": apt.get("time_slot", ""),
            "timestamp": apt.get("date", ""),
            "title": f"Appointment with Dr. {doctor_name}",
            "subtitle": apt.get("reason") or apt.get("status", ""),
            "status": apt.get("status", "Pending"),
            "doctor_name": doctor_name,
            "icon": "calendar",
            "color": "#3b82f6",
            "metadata": {
                "doctor_id": apt.get("doctor_id"),
                "hospital_id": apt.get("hospital_id"),
                "time_slot": apt.get("time_slot"),
                "reason": apt.get("reason")
            }
        })

    # ── 2. MEDICAL REPORTS ───────────────────────────────────
    cursor = db["reports"].find({"patient_id": patient_id}).sort("uploaded_at", -1)
    reports = await cursor.to_list(length=500)
    for rep in reports:
        uploaded_str = _safe_dt_str(rep.get("uploaded_at", ""))
        date_part = uploaded_str[:10] if uploaded_str else ""
        report_name = rep.get("original_filename") or rep.get("file_name") or "Medical Report"
        events.append({
            "event_type": "report",
            "event_id": str(rep["_id"]),
            "date": date_part,
            "time": uploaded_str[11:16] if len(uploaded_str) > 11 else "",
            "timestamp": uploaded_str,
            "title": f"Report Uploaded: {report_name}",
            "subtitle": rep.get("summary") or rep.get("report_type") or "Lab / Diagnostic Report",
            "status": "Uploaded",
            "icon": "file-text",
            "color": "#8b5cf6",
            "metadata": {
                "file_name": report_name,
                "report_type": rep.get("report_type"),
                "has_analysis": bool(rep.get("ai_analysis") or rep.get("extracted_data"))
            }
        })

    # ── 3. PRESCRIPTIONS ─────────────────────────────────────
    cursor = db["prescriptions"].find({"patient_id": patient_id}).sort("created_at", -1)
    prescriptions = await cursor.to_list(length=500)
    for rx in prescriptions:
        created_str = _safe_dt_str(rx.get("created_at", ""))
        date_part = created_str[:10] if created_str else ""
        doctor_name = rx.get("doctor_name", "Doctor")
        med_count = len(rx.get("medicines", []))
        events.append({
            "event_type": "prescription",
            "event_id": str(rx["_id"]),
            "date": date_part,
            "time": created_str[11:16] if len(created_str) > 11 else "",
            "timestamp": created_str,
            "title": f"Prescription by Dr. {doctor_name}",
            "subtitle": rx.get("diagnosis", ""),
            "status": rx.get("status", "draft").capitalize(),
            "doctor_name": doctor_name,
            "icon": "pill",
            "color": "#22c55e",
            "metadata": {
                "diagnosis": rx.get("diagnosis"),
                "medicine_count": med_count,
                "follow_up_date": rx.get("follow_up_date"),
                "status": rx.get("status")
            }
        })

    # ── 4. FOLLOW-UPS ────────────────────────────────────────
    cursor = db["follow_ups"].find({"patient_id": patient_id}).sort("due_date", -1)
    followups = await cursor.to_list(length=500)
    for fu in followups:
        created_str = _safe_dt_str(fu.get("created_at", ""))
        doctor_name = fu.get("doctor_name", "Doctor")
        type_labels = {
            "review": "Review Visit",
            "medicine": "Medicine Reminder",
            "test": "Lab Test Due",
            "general": "Follow-up"
        }
        type_icons = {
            "review": "stethoscope",
            "medicine": "pill",
            "test": "flask",
            "general": "bell"
        }
        events.append({
            "event_type": "followup",
            "event_id": str(fu["_id"]),
            "date": fu.get("due_date", ""),
            "time": fu.get("due_time", ""),
            "timestamp": fu.get("due_date", ""),
            "title": f"{type_labels.get(fu.get('type', 'general'), 'Follow-up')}: {fu.get('title', '')}",
            "subtitle": f"By Dr. {doctor_name}" + (f" — {fu.get('description')}" if fu.get("description") else ""),
            "status": fu.get("status", "pending").capitalize(),
            "doctor_name": doctor_name,
            "icon": type_icons.get(fu.get("type", "general"), "bell"),
            "color": "#f59e0b",
            "metadata": {
                "type": fu.get("type"),
                "due_date": fu.get("due_date"),
                "due_time": fu.get("due_time"),
                "status": fu.get("status"),
                "is_overdue": fu.get("status") == "pending" and fu.get("due_date", "") < datetime.now().strftime("%Y-%m-%d")
            }
        })

    # ── SORT: newest date first ───────────────────────────────
    def sort_key(ev):
        ts = ev.get("timestamp") or ev.get("date") or ""
        return ts

    events.sort(key=sort_key, reverse=True)
    return events


# ─────────────────────────────────────────────────────────────
# GET /timeline/my — Patient views own timeline
# ─────────────────────────────────────────────────────────────

@router.get("/my")
async def get_my_timeline(current_user: dict = Depends(verify_token)):
    """
    Patient gets their complete chronological medical timeline.
    Includes: appointments, reports, prescriptions, follow-ups.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Patient":
        raise HTTPException(status_code=403, detail="This endpoint is for patients only. Doctors use /timeline/{patient_id}")

    events = await _build_timeline(db, user_id)
    return {
        "patient_id": user_id,
        "total_events": len(events),
        "events": events
    }


# ─────────────────────────────────────────────────────────────
# GET /timeline/{patient_id} — Doctor views patient's timeline
# ─────────────────────────────────────────────────────────────

@router.get("/{patient_id}")
async def get_patient_timeline(
    patient_id: str,
    current_user: dict = Depends(verify_token)
):
    """
    Doctor views a specific patient's timeline.
    Authorization: The doctor must have at least one appointment with this patient.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role not in ["Doctor", "Admin"]:
        raise HTTPException(status_code=403, detail="Access restricted to Doctor or Admin role")

    # Validate patient exists
    try:
        patient = await db["users"].find_one({"_id": ObjectId(patient_id), "role": "Patient"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Authorization check for Doctors: must have an appointment with this patient
    if role == "Doctor":
        relationship = await db["appointments"].find_one({
            "doctor_id": user_id,
            "patient_id": patient_id
        })
        if not relationship:
            raise HTTPException(
                status_code=403,
                detail="You can only view timelines of patients who have had appointments with you"
            )

    events = await _build_timeline(db, patient_id)
    return {
        "patient_id": patient_id,
        "patient_name": patient.get("name", ""),
        "total_events": len(events),
        "events": events
    }
