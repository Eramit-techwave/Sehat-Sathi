# /**
#  * Backend Invoice Route — Sehat-Sathi
#  * Manages invoice generation, storage, and retrieval for appointments & services.
#  **/
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_db
from app.auth_utils import verify_token
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import random

router = APIRouter(prefix="/invoices", tags=["Payment Invoices"])

class InvoiceCreate(BaseModel):
    appointment_id: Optional[str] = None
    patient_name: str
    patient_id: Optional[str] = None
    doctor_name: str
    doctor_specialization: Optional[str] = "General Physician"
    hospital_name: Optional[str] = "Sehat-Sathi Health Clinic"
    service_name: Optional[str] = "General Health Consultation"
    base_amount: float = Field(..., gt=0)
    tax_rate: float = Field(default=18.0) # GST 18%
    discount: float = Field(default=0.0)
    payment_method: str = Field(default="UPI") # 'UPI' | 'Card' | 'NetBanking' | 'Cash'
    payment_status: str = Field(default="PAID") # 'PAID' | 'Cash at Clinic'
    transaction_id: Optional[str] = None

@router.post("/generate")
async def generate_invoice(invoice_data: InvoiceCreate, current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    # Generate unique Invoice Number
    inv_number = f"INV-2026-{random.randint(10000, 99999)}"

    # Calculate financial breakdown
    base = round(invoice_data.base_amount, 2)
    tax = round(base * (invoice_data.tax_rate / 100.0), 2)
    discount = round(invoice_data.discount, 2)
    total = round(base + tax - discount, 2)

    ref_number = invoice_data.transaction_id or f"SS-PAY-{random.randint(100000, 999999)}"

    doc = {
        "invoice_number": inv_number,
        "user_id": user_id,
        "patient_name": invoice_data.patient_name,
        "patient_id": invoice_data.patient_id or f"PAT-{user_id[:6].upper()}",
        "doctor_name": invoice_data.doctor_name,
        "doctor_specialization": invoice_data.doctor_specialization,
        "hospital_name": invoice_data.hospital_name,
        "service_name": invoice_data.service_name,
        "base_amount": base,
        "tax_rate": invoice_data.tax_rate,
        "tax_amount": tax,
        "discount": discount,
        "total_amount": total,
        "payment_method": invoice_data.payment_method,
        "payment_status": invoice_data.payment_status,
        "reference_number": ref_number,
        "transaction_id": ref_number,
        "founder_name": "Amit Dubey",
        "company_name": "Sehat-Sathi",
        "company_url": "www.sehatsathi.com",
        "created_at": datetime.now()
    }

    res = await db["invoices"].insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc

@router.get("/my")
async def get_my_invoices(current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    cursor = db["invoices"].find({"user_id": user_id}).sort("created_at", -1)
    invoices = []
    async for item in cursor:
        item["id"] = str(item["_id"])
        item.pop("_id", None)
        invoices.append(item)
    return invoices

@router.get("/{invoice_id}")
async def get_invoice_by_id(invoice_id: str, current_user: dict = Depends(verify_token)):
    db = get_db()
    try:
        inv = await db["invoices"].find_one({"_id": ObjectId(invoice_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID format")

    if not inv:
        raise HTTPException(status_code=404, detail="Invoice record not found")

    inv["id"] = str(inv["_id"])
    inv.pop("_id", None)
    return inv
