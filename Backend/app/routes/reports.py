import os
import re
import json
import uuid
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

# Resolve the absolute path of the storage directory once at startup
# This is used to prevent path traversal attacks when constructing file paths
STORAGE_DIR_ABS = os.path.realpath(STORAGE_DIR)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MIME_MAP = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}


class ChatRequest(BaseModel):
    message: str
    report_context: dict | None = None


def _secure_file_path(original_filename: str) -> tuple[str, str]:
    """
    Generate a secure, UUID-based file path for an uploaded file.

    Security fix: User-controlled filenames are never used directly in
    filesystem paths. Instead, we extract only the file extension (after
    validating it against the allowlist) and pair it with a UUID to produce
    a safe filename. This prevents path traversal attacks where a malicious
    actor could supply a filename such as '../../etc/passwd' or
    '../other_user/sensitive_file.pdf'.

    Returns:
        (secure_path, file_ext) — the absolute file path and the sanitised
        lowercase extension (e.g. '.pdf').
    """
    # Extract and normalise the extension only — never trust the basename
    _, raw_ext = os.path.splitext(original_filename)
    file_ext = raw_ext.lower()

    # Build a UUID-based filename; the original name is discarded entirely
    safe_filename = f"{uuid.uuid4().hex}{file_ext}"

    # Construct the full path and verify it stays inside STORAGE_DIR_ABS
    candidate = os.path.realpath(os.path.join(STORAGE_DIR_ABS, safe_filename))
    if not candidate.startswith(STORAGE_DIR_ABS + os.sep):
        # This should never happen with a UUID name, but is an extra safeguard
        raise ValueError("Resolved file path escapes the storage directory.")

    return candidate, file_ext


@router.post("/extract-report")
async def extract_report(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token),
):
    db = get_db()
    user_id = current_user.get("sub")

    # Validate file extension against the allowlist before any further processing
    _, raw_ext = os.path.splitext(file.filename or "")
    file_ext = raw_ext.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload PDF, JPG, or PNG.",
        )

    file_path = None
    try:
        file_bytes = await file.read()

        # Derive a safe path — the original filename is never embedded in the path
        file_path, file_ext = _secure_file_path(file.filename or "upload")

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

        mime_type = MIME_MAP.get(file_ext, "application/octet-stream")

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Content(
                    parts=[
                        types.Part(
                            inline_data=types.Blob(data=file_bytes, mime_type=mime_type)
                        ),
                        types.Part(text=system_ai_prompt),
                    ]
                )
            ],
        )

        raw_text = response.text.strip()
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        clean_json_string = json_match.group(0) if json_match else raw_text
        analysis_data = json.loads(clean_json_string)

        # Always enforce the disclaimer regardless of what the model returned
        if "ai_consultant_summary" in analysis_data:
            analysis_data["ai_consultant_summary"]["disclaimer"] = (
                "⚕️ This analysis is for informational purposes only and is not a substitute "
                "for professional medical advice. Please consult a qualified healthcare provider "
                "for diagnosis and treatment."
            )

        report_record = {
            "patient_id": user_id,
            # Store the original filename for display purposes only — never used in path ops
            "file_name": file.filename,
            "file_path": file_path,
            "analysis_data": analysis_data,
            "uploaded_at": datetime.now(),
        }
        result = await db["reports"].insert_one(report_record)

        analysis_data["report_id"] = str(result.inserted_id)
        return analysis_data

    except json.JSONDecodeError as je:
        print(f"JSON Parse Error: {je}")
        fallback_data = _get_fallback_data(file.filename or "unknown")
        await _save_fallback_report(
            db, user_id, file.filename or "unknown", file_path or "", fallback_data
        )
        return fallback_data
    except Exception as e:
        print(f"Extraction Error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Report processing failed: {str(e)}"
        )


def _get_fallback_data(filename: str) -> dict:
    return {
        "extracted_vitals": {"metabolic": "N/A", "cardio": "N/A", "confidence": "N/A"},
        "ai_consultant_summary": {
            "status_headline": "Report could not be fully analyzed",
            "critical_findings": "Unable to extract parameters from this report format.",
            "recommendations": "Please try uploading a clearer image or a text-based PDF.",
            "disclaimer": (
                "⚕️ This analysis is for informational purposes only and is not a substitute "
                "for professional medical advice. Please consult a qualified healthcare provider "
                "for diagnosis and treatment."
            ),
        },
        "parameters_table": [],
    }


async def _save_fallback_report(
    db, user_id: str, filename: str, file_path: str, fallback_data: dict
):
    record = {
        "patient_id": user_id,
        "file_name": filename,
        "file_path": file_path,
        "analysis_data": fallback_data,
        "uploaded_at": datetime.now(),
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
        if isinstance(r.get("uploaded_at"), datetime):
            r["uploaded_at"] = r["uploaded_at"].isoformat()
    return reports


@router.get("/reports/{report_id}")
async def get_report_detail(report_id: str, current_user: dict = Depends(verify_token)):
    from bson import ObjectId

    db = get_db()
    user_id = current_user.get("sub")

    try:
        report = await db["reports"].find_one(
            {"_id": ObjectId(report_id), "patient_id": user_id}
        )
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
            context_data = payload.report_context.get(
                "raw_parameters", payload.report_context
            )
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
            model="gemini-2.5-flash",
            contents=chat_prompt,
        )
        return {"response": response.text.strip()}
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return {"response": "System is busy right now. Please try again in a moment! 😊"}