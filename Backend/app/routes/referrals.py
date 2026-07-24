"""
Referral Engine — Sehat-Sathi V2 (Scaffolded)
===============================================
Doctor refers patient to another specialist.
Referral includes full medical context automatically:
  - Clinical summary
  - Recent prescriptions (optional)
  - Recent reports (optional)

The receiving doctor gets an instant notification with context.

Collection: referrals
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas_v2 import ReferralCreate

router = APIRouter(prefix="/referrals", tags=["V2 — Referral Engine"])


async def _notify(db, user_id, notif_type, title, message, metadata=None):
    try:
        await db["notifications"].insert_one({
            "user_id": user_id, "type": notif_type, "title": title,
            "message": message, "is_read": False,
            "metadata": metadata or {}, "created_at": datetime.now()
        })
    except Exception:
        pass


def _serialize(ref: dict) -> dict:
    ref["id"] = str(ref.pop("_id"))
    if isinstance(ref.get("created_at"), datetime):
        ref["created_at"] = ref["created_at"].isoformat()
    if isinstance(ref.get("accepted_at"), datetime):
        ref["accepted_at"] = ref["accepted_at"].isoformat()
    return ref


@router.post("/")
async def create_referral(
    ref_data: ReferralCreate,
    current_user: dict = Depends(verify_token)
):
    """
    Doctor creates a referral for a patient to see another specialist.
    The receiving doctor immediately gets a notification with patient context.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create referrals")

    # Validate patient
    try:
        patient = await db["users"].find_one({"_id": ObjectId(ref_data.patient_id), "role": "Patient"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Validate receiving doctor
    try:
        receiving_doc = await db["users"].find_one({
            "_id": ObjectId(ref_data.referred_to_doctor_id), "role": "Doctor"
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid target doctor ID")
    if not receiving_doc:
        raise HTTPException(status_code=404, detail="Target doctor not found")
    if ref_data.referred_to_doctor_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot refer a patient to yourself")

    referring_doctor = await db["users"].find_one({"_id": ObjectId(user_id)})
    referring_name = referring_doctor.get("name", "Doctor") if referring_doctor else "Doctor"
    receiving_name = receiving_doc.get("name", "Doctor")

    # Collect recent medical context if requested
    context = {}
    if ref_data.include_prescriptions:
        recent_rx = await db["prescriptions"].find(
            {"patient_id": ref_data.patient_id, "status": "finalized"}
        ).sort("created_at", -1).limit(3).to_list(length=3)
        context["recent_prescriptions"] = [
            {"diagnosis": rx.get("diagnosis"), "medicines": rx.get("medicines", []),
             "created_at": rx["created_at"].isoformat() if isinstance(rx.get("created_at"), datetime) else ""}
            for rx in recent_rx
        ]

    if ref_data.include_reports:
        recent_reports = await db["reports"].find(
            {"patient_id": ref_data.patient_id}
        ).sort("uploaded_at", -1).limit(3).to_list(length=3)
        context["recent_reports"] = [
            {"file_name": r.get("original_filename") or r.get("file_name", "Report"),
             "report_type": r.get("report_type", ""),
             "id": str(r["_id"])}
            for r in recent_reports
        ]

    new_referral = {
        "referring_doctor_id": user_id,
        "referring_doctor_name": referring_name,
        "referred_to_doctor_id": ref_data.referred_to_doctor_id,
        "referred_to_doctor_name": receiving_name,
        "patient_id": ref_data.patient_id,
        "patient_name": patient.get("name", "Patient"),
        "appointment_id": ref_data.appointment_id,
        "reason": ref_data.reason,
        "clinical_summary": ref_data.clinical_summary,
        "urgency": ref_data.urgency,
        "medical_context": context,
        "status": "pending",  # pending | accepted | completed | rejected
        "created_at": datetime.now(),
        "accepted_at": None
    }

    result = await db["referrals"].insert_one(new_referral)
    referral_id = str(result.inserted_id)

    # Notify receiving doctor with full context
    await _notify(
        db, ref_data.referred_to_doctor_id, "referral_received",
        f"Patient Referral from Dr. {referring_name} 📋",
        f"Dr. {referring_name} has referred {patient.get('name', 'a patient')} to you for: {ref_data.reason}",
        {
            "referral_id": referral_id,
            "patient_id": ref_data.patient_id,
            "patient_name": patient.get("name", ""),
            "urgency": ref_data.urgency,
            "referring_doctor": referring_name
        }
    )

    # Notify patient
    await _notify(
        db, ref_data.patient_id, "referral_created",
        f"Referral Created by Dr. {referring_name} 📋",
        f"Dr. {referring_name} has referred you to Dr. {receiving_name} for: {ref_data.reason}",
        {"referral_id": referral_id, "target_doctor": receiving_name}
    )

    return {
        "success": True,
        "referral_id": referral_id,
        "message": f"Referral sent to Dr. {receiving_name} with patient context"
    }


@router.get("/my")
async def get_my_referrals(current_user: dict = Depends(verify_token)):
    """
    Doctor: referrals they sent (outgoing) + referrals sent to them (incoming).
    Patient: referrals created for them.
    """
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role == "Doctor":
        outgoing = await db["referrals"].find(
            {"referring_doctor_id": user_id}
        ).sort("created_at", -1).to_list(length=200)
        incoming = await db["referrals"].find(
            {"referred_to_doctor_id": user_id}
        ).sort("created_at", -1).to_list(length=200)
        return {
            "outgoing": [_serialize(r) for r in outgoing],
            "incoming": [_serialize(r) for r in incoming]
        }
    elif role == "Patient":
        cursor = db["referrals"].find({"patient_id": user_id}).sort("created_at", -1)
        referrals = await cursor.to_list(length=200)
        return [_serialize(r) for r in referrals]
    else:
        raise HTTPException(status_code=403, detail="Access restricted")


@router.put("/{referral_id}/accept")
async def accept_referral(referral_id: str, current_user: dict = Depends(verify_token)):
    """Receiving doctor accepts the referral."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can accept referrals")

    try:
        ref = await db["referrals"].find_one({"_id": ObjectId(referral_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid referral ID")
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    if ref["referred_to_doctor_id"] != user_id:
        raise HTTPException(status_code=403, detail="This referral is not addressed to you")

    await db["referrals"].update_one(
        {"_id": ObjectId(referral_id)},
        {"$set": {"status": "accepted", "accepted_at": datetime.now()}}
    )

    # Notify referring doctor
    await _notify(
        db, ref["referring_doctor_id"], "referral_accepted",
        f"Referral Accepted ✅",
        f"Dr. {ref.get('referred_to_doctor_name', 'The specialist')} has accepted your referral for patient {ref.get('patient_name', '')}.",
        {"referral_id": referral_id, "patient_id": ref["patient_id"]}
    )

    return {"success": True, "message": "Referral accepted"}
