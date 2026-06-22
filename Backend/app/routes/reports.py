import os
import re
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
import google.genai as genai
from google.genai import types
from app.config import settings
from app.database import get_db
from app.auth_utils import verify_token

router = APIRouter(prefix="/api", tags=["Neural Extraction Layer"])
client = genai.Client(api_key=settings.PARSER_API_KEY)

# Ensure storage directory exists
STORAGE_DIR = "stored_reports"
os.makedirs(STORAGE_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    message: str
    report_context: dict | None = None

@router.post("/extract-report")
async def extract_report(file: UploadFile = File(...), current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")

    allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload PDF, JPG, or PNG.")

    try:
        file_bytes = await file.read()

        # Save file locally
        file_path = os.path.join(STORAGE_DIR, f"{user_id}_{int(datetime.now().timestamp())}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        system_ai_prompt = f"""
        You are an expert AI Medical Consultant. Analyze the attached medical report and perform the following tasks:

        1. Extract all biomarkers/parameters into a structured table.
        2. For each parameter, provide its value, normal reference range, status (Normal/High/Low), and a plain-language explanation of what it means.
        3. Identify any values outside the normal range and flag them.
        4. Provide general diet and lifestyle suggestions relevant to any flagged values.
        5. Provide an overall summary in simple, accessible language.

        CRITICAL SAFETY RULES:
        - Do NOT diagnose any medical condition or disease.
        - Do NOT recommend any medicines, drugs, or dosages.
        - Use plain, accessible language that a non-medical person can understand.
        - Always include the disclaimer that this is informational only.

        Return ONLY valid JSON in this exact structure:
        {{
          "extracted_vitals": {{
            "metabolic": "Estimated metabolic rate if available",
            "cardio": "Heart rate if available",
            "confidence": "Analysis confidence percentage"
          }},
          "ai_consultant_summary": {{
            "status_headline": "One-sentence summary of overall health status",
            "critical_findings": "Description of parameters outside normal range in plain language",
            "recommendations": "General diet and lifestyle suggestions (no medicines)",
            "disclaimer": "⚕️ This analysis is for informational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for diagnosis and treatment."
          }},
          "parameters_table": [
            {{
              "name": "Biomarker Name",
              "value": "141.0 mg/dL",
              "normal_range": "70 - 100 mg/dL",
              "status": "High",
              "plain_explanation": "Simple explanation of what this parameter means and why the value matters",
              "issue_description": "Brief note if outside range"
            }}
          ]
        }}
        """

        mime_map = {".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
        mime_type = mime_map.get(file_ext, "application/octet-stream")

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Content(parts=[
                    types.Part(inline_data=types.Blob(data=file_bytes, mime_type=mime_type)),
                    types.Part(text=system_ai_prompt)
                ])
            ]
        )

        raw_text = response.text.strip()
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        clean_json_string = json_match.group(0) if json_match else raw_text
        analysis_data = json.loads(clean_json_string)

        # Ensure disclaimer always present
        if "ai_consultant_summary" in analysis_data:
            analysis_data["ai_consultant_summary"]["disclaimer"] = (
                "⚕️ This analysis is for informational purposes only and is not a substitute "
                "for professional medical advice. Please consult a qualified healthcare provider "
                "for diagnosis and treatment."
            )

        # Save to DB scoped to this user
        report_record = {
            "patient_id": user_id,
            "file_name": file.filename,
            "file_path": file_path,
            "analysis_data": analysis_data,
            "uploaded_at": datetime.now()
        }
        result = await db["reports"].insert_one(report_record)

        # Return with ID
        analysis_data["report_id"] = str(result.inserted_id)
        return analysis_data

    except json.JSONDecodeError as je:
        print(f"JSON Parse Error: {je}")
        fallback_data = _get_fallback_data(file.filename)
        await _save_fallback_report(db, user_id, file.filename, file_path if 'file_path' in dir() else "", fallback_data)
        return fallback_data
    except Exception as e:
        print(f"Extraction Error: {e}")
        raise HTTPException(status_code=500, detail=f"Report processing failed: {str(e)}")


def _get_fallback_data(filename: str) -> dict:
    return {
        "extracted_vitals": {"metabolic": "N/A", "cardio": "N/A", "confidence": "N/A"},
        "ai_consultant_summary": {
            "status_headline": "Report could not be fully analyzed",
            "critical_findings": "Unable to extract parameters from this report format.",
            "recommendations": "Please try uploading a clearer image or a text-based PDF.",
            "disclaimer": "⚕️ This analysis is for informational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for diagnosis and treatment."
        },
        "parameters_table": []
    }


async def _save_fallback_report(db, user_id: str, filename: str, file_path: str, fallback_data: dict):
    record = {
        "patient_id": user_id,
        "file_name": filename,
        "file_path": file_path,
        "analysis_data": fallback_data,
        "uploaded_at": datetime.now()
    }
    await db["reports"].insert_one(record)


@router.get("/reports/my")
async def get_my_reports(current_user: dict = Depends(verify_token)):
    db = get_db()
    user_id = current_user.get("sub")
    cursor = db["reports"].find({"patient_id": user_id}).sort("uploaded_at", -1)
    reports = await cursor.to_list(length=100)

    for r in reports:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
        # Convert datetime to ISO string for JSON serialization
        if isinstance(r.get("uploaded_at"), datetime):
            r["uploaded_at"] = r["uploaded_at"].isoformat()
    return reports


@router.get("/reports/{report_id}")
async def get_report_detail(report_id: str, current_user: dict = Depends(verify_token)):
    from bson import ObjectId
    db = get_db()
    user_id = current_user.get("sub")

    try:
        report = await db["reports"].find_one({"_id": ObjectId(report_id), "patient_id": user_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    if not report:
        raise HTTPException(status_code=404, detail="Report not found or access denied")

    report["id"] = str(report["_id"])
    report.pop("_id", None)
    if isinstance(report.get("uploaded_at"), datetime):
        report["uploaded_at"] = report["uploaded_at"].isoformat()

    return report


@router.post("/chat-report")
async def chat_with_report(payload: ChatRequest):
    try:
        if payload.report_context and isinstance(payload.report_context, dict):
            context_data = payload.report_context.get("raw_parameters", payload.report_context)
        else:
            context_data = {}

        context_string = json.dumps(context_data, indent=2)

        chat_prompt = f"""
        You are 'Sehat-Sathi', a friendly and caring AI health information assistant.
        Talk directly to the user in short, clear, and empathetic language.

        [PATIENT REPORT DATA CONTEXT]
        {context_string}

        [USER QUESTION]
        "{payload.message}"

        [STRICT RULES]
        1. Keep your answer SHORT, CRISP, and DIRECT (2-4 lines maximum).
        2. Answer ONLY the specific question asked.
        3. If asked about diet, give 2-3 specific food items relevant to their parameters.
        4. TONE: Empathetic, supportive, clear, and friendly.
        5. NEVER prescribe medicines, dosages, or diagnose conditions.
        6. ALWAYS remind the user to consult a doctor for medical decisions.
        7. You CAN explain what medical terms mean (e.g., "What is Hemoglobin?").

        Respond in simple, accessible language. End with a brief disclaimer if giving health advice.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=chat_prompt
        )
        return {"response": response.text.strip()}
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return {"response": "System is busy right now. Please try again in a moment! 😊"}