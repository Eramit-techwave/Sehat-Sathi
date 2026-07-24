"""
Digital Prescription Routes — Sehat-Sathi V2
=============================================
Doctors create structured digital prescriptions.
Patients receive them instantly — no paper required.

Collections: prescriptions
Notifications: prescription_created (patient)
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas_v2 import PrescriptionCreate

router = APIRouter(prefix="/prescriptions", tags=["V2 — Digital Prescriptions"])


# ─── Internal notification helper ──────────────────────────────
async def _notify(db, user_id: str, notif_type: str, title: str, message: str, metadata: dict = None):
    try:
        await db["notifications"].insert_one({
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "message": message,
            "is_read": False,
            "metadata": metadata or {},
            "created_at": datetime.now()
        })
    except Exception:
        pass  # Notifications must never break core flow


def _serialize_prescription(rx: dict) -> dict:
    """Normalize ObjectId and datetime fields for JSON response."""
    rx["id"] = str(rx.pop("_id"))
    if isinstance(rx.get("created_at"), datetime):
        rx["created_at"] = rx["created_at"].isoformat()
    if isinstance(rx.get("finalized_at"), datetime):
        rx["finalized_at"] = rx["finalized_at"].isoformat()
    return rx


# ─────────────────────────────────────────────────────────────
# POST /prescriptions/ — Doctor creates a prescription
# ─────────────────────────────────────────────────────────────

@router.post("/")
async def create_prescription(
    rx_data: PrescriptionCreate,
    current_user: dict = Depends(verify_token)
):
    """
    Doctor creates a digital prescription for a patient.
    Instantly notifies the patient via in-app notification.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")

    # Validate patient exists
    try:
        patient = await db["users"].find_one({"_id": ObjectId(rx_data.patient_id), "role": "Patient"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Fetch doctor's name for notification
    doctor = await db["users"].find_one({"_id": ObjectId(user_id)})
    doctor_name = doctor.get("name", "Your Doctor") if doctor else "Your Doctor"
    patient_name = patient.get("name", "Patient")

    # Validate linked appointment if provided
    if rx_data.appointment_id:
        try:
            apt = await db["appointments"].find_one({"_id": ObjectId(rx_data.appointment_id)})
            if not apt:
                rx_data.appointment_id = None  # Silently ignore invalid appointment link
        except Exception:
            rx_data.appointment_id = None

    # Serialize medicines to plain dicts
    medicines_list = [m.model_dump() for m in rx_data.medicines]

    new_rx = {
        "doctor_id": user_id,
        "patient_id": rx_data.patient_id,
        "appointment_id": rx_data.appointment_id,
        "doctor_name": doctor_name,
        "patient_name": patient_name,
        "diagnosis": rx_data.diagnosis,
        "medicines": medicines_list,
        "notes": rx_data.notes,
        "follow_up_date": rx_data.follow_up_date,
        "status": rx_data.status or "draft",
        "created_at": datetime.now(),
        "finalized_at": datetime.now() if rx_data.status == "finalized" else None
    }

    result = await db["prescriptions"].insert_one(new_rx)
    rx_id = str(result.inserted_id)

    # Notify patient
    if rx_data.status == "finalized":
        await _notify(
            db, rx_data.patient_id, "prescription_created",
            f"New Prescription from Dr. {doctor_name} 💊",
            f"Dr. {doctor_name} has issued you a prescription for: {rx_data.diagnosis}",
            {"prescription_id": rx_id, "doctor_name": doctor_name}
        )

    return {
        "success": True,
        "message": f"Prescription {'finalized' if rx_data.status == 'finalized' else 'saved as draft'} successfully",
        "prescription_id": rx_id
    }


# ─────────────────────────────────────────────────────────────
# GET /prescriptions/my — Patient views received prescriptions
# ─────────────────────────────────────────────────────────────

@router.get("/my")
async def get_my_prescriptions(current_user: dict = Depends(verify_token)):
    """
    Patient: gets all prescriptions issued to them.
    Doctor: gets all prescriptions they have issued.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role == "Patient":
        query = {"patient_id": user_id}
    elif role == "Doctor":
        query = {"doctor_id": user_id}
    else:
        raise HTTPException(status_code=403, detail="Access restricted to Patient or Doctor role")

    cursor = db["prescriptions"].find(query).sort("created_at", -1)
    prescriptions = await cursor.to_list(length=200)
    return [_serialize_prescription(rx) for rx in prescriptions]


# ─────────────────────────────────────────────────────────────
# GET /prescriptions/{id} — Get single prescription
# ─────────────────────────────────────────────────────────────

@router.get("/{prescription_id}")
async def get_prescription(
    prescription_id: str,
    current_user: dict = Depends(verify_token)
):
    """Fetch a single prescription. Access: issuing doctor or receiving patient."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    try:
        rx = await db["prescriptions"].find_one({"_id": ObjectId(prescription_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prescription ID")
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Authorization: must be the issuing doctor or the patient
    if role == "Patient" and rx["patient_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if role == "Doctor" and rx["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return _serialize_prescription(rx)


# ─────────────────────────────────────────────────────────────
# PUT /prescriptions/{id}/finalize — Doctor finalizes a draft
# ─────────────────────────────────────────────────────────────

@router.put("/{prescription_id}/finalize")
async def finalize_prescription(
    prescription_id: str,
    current_user: dict = Depends(verify_token)
):
    """
    Doctor finalizes a draft prescription.
    Once finalized, it becomes immutable and the patient is notified.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can finalize prescriptions")

    try:
        rx = await db["prescriptions"].find_one({"_id": ObjectId(prescription_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prescription ID")
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if rx["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only finalize your own prescriptions")
    if rx.get("status") == "finalized":
        raise HTTPException(status_code=400, detail="Prescription is already finalized")

    now = datetime.now()
    await db["prescriptions"].update_one(
        {"_id": ObjectId(prescription_id)},
        {"$set": {"status": "finalized", "finalized_at": now}}
    )

    # Notify patient
    doctor = await db["users"].find_one({"_id": ObjectId(user_id)})
    doctor_name = doctor.get("name", "Your Doctor") if doctor else "Your Doctor"

    await _notify(
        db, rx["patient_id"], "prescription_created",
        f"Prescription Ready — Dr. {doctor_name} 💊",
        f"Your prescription for {rx.get('diagnosis', 'your condition')} is now ready.",
        {"prescription_id": prescription_id, "doctor_name": doctor_name}
    )

    return {"success": True, "message": "Prescription finalized and patient notified"}


# ─────────────────────────────────────────────────────────────
# PUT /prescriptions/{id} — Doctor updates a draft
# ─────────────────────────────────────────────────────────────

@router.put("/{prescription_id}")
async def update_prescription(
    prescription_id: str,
    rx_data: PrescriptionCreate,
    current_user: dict = Depends(verify_token)
):
    """Doctor updates a draft prescription. Finalized prescriptions cannot be edited."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can edit prescriptions")

    try:
        rx = await db["prescriptions"].find_one({"_id": ObjectId(prescription_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prescription ID")
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if rx["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own prescriptions")
    if rx.get("status") == "finalized":
        raise HTTPException(status_code=400, detail="Finalized prescriptions cannot be edited")

    medicines_list = [m.model_dump() for m in rx_data.medicines]
    update_data = {
        "diagnosis": rx_data.diagnosis,
        "medicines": medicines_list,
        "notes": rx_data.notes,
        "follow_up_date": rx_data.follow_up_date,
        "updated_at": datetime.now()
    }
    await db["prescriptions"].update_one(
        {"_id": ObjectId(prescription_id)},
        {"$set": update_data}
    )
    return {"success": True, "message": "Prescription updated successfully"}


# ─────────────────────────────────────────────────────────────
# DELETE /prescriptions/{id} — Doctor soft-deletes a draft
# ─────────────────────────────────────────────────────────────

@router.delete("/{prescription_id}")
async def delete_prescription(
    prescription_id: str,
    current_user: dict = Depends(verify_token)
):
    """Doctor deletes a draft prescription. Finalized prescriptions cannot be deleted."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can delete prescriptions")

    try:
        rx = await db["prescriptions"].find_one({"_id": ObjectId(prescription_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prescription ID")
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if rx["doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own prescriptions")
    if rx.get("status") == "finalized":
        raise HTTPException(status_code=400, detail="Finalized prescriptions cannot be deleted. Contact admin.")

    await db["prescriptions"].delete_one({"_id": ObjectId(prescription_id)})
    return {"success": True, "message": "Draft prescription deleted"}
