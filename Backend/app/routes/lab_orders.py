"""
Smart Lab Workflow — Sehat-Sathi V2 (Scaffolded)
==================================================
Doctor digitally orders lab tests.
Lab receives request and uploads results.
Patient sees test status in real-time.
Doctor notified when reports are ready.

Collection: lab_orders
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_db
from app.auth_utils import verify_token
from app.schemas_v2 import LabOrderCreate

router = APIRouter(prefix="/lab-orders", tags=["V2 — Lab Workflow"])

VALID_STATUSES = {"ordered", "sample_collected", "processing", "completed", "cancelled"}


async def _notify(db, user_id, notif_type, title, message, metadata=None):
    try:
        await db["notifications"].insert_one({
            "user_id": user_id, "type": notif_type, "title": title,
            "message": message, "is_read": False,
            "metadata": metadata or {}, "created_at": datetime.now()
        })
    except Exception:
        pass


def _serialize(order: dict) -> dict:
    order["id"] = str(order.pop("_id"))
    if isinstance(order.get("created_at"), datetime):
        order["created_at"] = order["created_at"].isoformat()
    if isinstance(order.get("completed_at"), datetime):
        order["completed_at"] = order["completed_at"].isoformat()
    return order


@router.post("/")
async def create_lab_order(
    order: LabOrderCreate,
    current_user: dict = Depends(verify_token)
):
    """Doctor creates a digital lab order for a patient."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role != "Doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create lab orders")

    try:
        patient = await db["users"].find_one({"_id": ObjectId(order.patient_id), "role": "Patient"})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = await db["users"].find_one({"_id": ObjectId(user_id)})
    doctor_name = doctor.get("name", "Doctor") if doctor else "Doctor"

    new_order = {
        "doctor_id": user_id,
        "patient_id": order.patient_id,
        "prescription_id": order.prescription_id,
        "doctor_name": doctor_name,
        "patient_name": patient.get("name", "Patient"),
        "tests": [t.model_dump() for t in order.tests],
        "urgency": order.urgency,
        "notes": order.notes,
        "status": "ordered",
        "created_at": datetime.now(),
        "completed_at": None,
        "result_report_id": None  # Will link to a report_id when uploaded
    }

    result = await db["lab_orders"].insert_one(new_order)
    order_id = str(result.inserted_id)

    test_names = ", ".join(t.test_name for t in order.tests)
    await _notify(
        db, order.patient_id, "lab_order_created",
        f"Lab Test Ordered by Dr. {doctor_name} 🧪",
        f"Dr. {doctor_name} has ordered lab tests for you: {test_names}",
        {"lab_order_id": order_id}
    )

    return {
        "success": True,
        "lab_order_id": order_id,
        "message": f"Lab order created for {len(order.tests)} test(s)"
    }


@router.get("/my")
async def get_my_lab_orders(current_user: dict = Depends(verify_token)):
    """Patient: their lab orders. Doctor: orders they issued."""
    db = get_db()
    user_id = current_user.get("sub")
    role = current_user.get("role")

    if role == "Patient":
        query = {"patient_id": user_id}
    elif role == "Doctor":
        query = {"doctor_id": user_id}
    else:
        raise HTTPException(status_code=403, detail="Access restricted")

    cursor = db["lab_orders"].find(query).sort("created_at", -1)
    orders = await cursor.to_list(length=200)
    return [_serialize(o) for o in orders]


@router.put("/{order_id}/status")
async def update_lab_order_status(
    order_id: str,
    payload: dict,
    current_user: dict = Depends(verify_token)
):
    """Update a lab order status. Used by Hospital/Lab staff."""
    db = get_db()
    role = current_user.get("role")
    if role not in ["Hospital", "Admin"]:
        raise HTTPException(status_code=403, detail="Only hospital staff can update lab order status")

    new_status = payload.get("status")
    if new_status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {', '.join(VALID_STATUSES)}")

    try:
        order = await db["lab_orders"].find_one({"_id": ObjectId(order_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lab order ID")
    if not order:
        raise HTTPException(status_code=404, detail="Lab order not found")

    update_data = {"status": new_status}
    if new_status == "completed":
        update_data["completed_at"] = datetime.now()

    await db["lab_orders"].update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )

    # Notify doctor when results are ready
    if new_status == "completed":
        await _notify(
            db, order["doctor_id"], "lab_results_ready",
            "Lab Results Ready 🧪✅",
            f"Lab results for patient {order.get('patient_name', '')} are now available.",
            {"lab_order_id": order_id, "patient_id": order["patient_id"]}
        )
        await _notify(
            db, order["patient_id"], "lab_results_ready",
            "Your Lab Results Are Ready 🧪",
            "Your lab test results are now available. Check your reports section.",
            {"lab_order_id": order_id}
        )

    return {"success": True, "message": f"Lab order status updated to '{new_status}'"}
