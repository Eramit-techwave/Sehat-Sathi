from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from google import genai
from google.genai import types
from app.config import settings
from app.database import get_db
from app.auth_utils import verify_token
from pydantic import BaseModel
from datetime import datetime
import json
import pypdf
import io

router = APIRouter(
    prefix="/analyze",
    tags=["AI Report Analyzer & History"]
)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# 🎯 CRITICAL FIX: Prompt variables aur description ko fully rigid (strict) banaya gaya hai.
MEDICAL_OUTPUT_STRUCTURE = """
{
    "patient_name": "Extract EXACTLY the patient's full name from the designated patient information section of the report. Do NOT use names of doctors, pathologists, or laboratory staff. If the patient name is completely missing or unreadable, output strictly as 'Unknown'.",
    "summary": "one simple sentence explaining the overall report",
    "parameters": [
        {
            "name": "Parameter Name",
            "value": "Value with unit",
            "status": "NORMAL or WARNING or CRITICAL",
            "explanation": "Simple common-man explanation",
            "finding": "What is wrong or right"
        }
    ],
    "recommendations": {
        "diet": ["bullet point 1"],
        "lifestyle": ["bullet point 1"]
    },
    "disclaimer": "Medical disclaimer text"
}
"""

class ReportInput(BaseModel):
    report_text: str

# --- 1. EXISTING TEXT ENDPOINT ---
@router.post("/text")
async def analyze_report_text(data: ReportInput, current_user: dict = Depends(verify_token)):
    try:
        user_id = current_user.get("sub")
        medical_prompt = f"""
        You are 'Sehat-Sathi AI', a precise medical diagnostic report assistant. 
        Analyze this medical report text and output strictly as a JSON object matching the schema below.
        
        CRITICAL RULES:
        1. Do NOT write any introduction, conversational filler, or conclusion. 
        2. Do NOT use markdown code blocks like ```json.
        3. Do NOT hallucinate patient names. Check the header fields carefully.
        
        Return exactly this structure: {MEDICAL_OUTPUT_STRUCTURE}

        Raw Report Text:
        {data.report_text}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=medical_prompt,
            config=types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json")
        )
        
        clean_json_output = json.loads(response.text)
        db = get_db()
        
        report_document = {
            "user_id": user_id,
            "raw_text": data.report_text,
            "ai_analysis": clean_json_output,
            "created_at": datetime.utcnow()
        }
        result = await db["reports"].insert_one(report_document)
        
        return {"status": "success", "report_id": str(result.inserted_id), "model_used": "gemini-2.5-flash (Text Mode)", "data": clean_json_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI/DB Text Error: {str(e)}")


# --- 2. NEW FILE UPLOAD ENDPOINT (PDF & IMAGES) ---
@router.post("/file")
async def analyze_report_file(file: UploadFile = File(...), current_user: dict = Depends(verify_token)):
    """
    Accepts PDF or Image files, extracts content, passes to Gemini AI with strict guardrails, and saves to MongoDB.
    """
    try:
        user_id = current_user.get("sub")
        file_bytes = await file.read()
        extracted_text = ""
        is_image = False
        content_type = file.content_type
        
        # A. If File is PDF
        if content_type == "application/pdf" or file.filename.endswith('.pdf'):
            pdf_file = io.BytesIO(file_bytes)
            reader = pypdf.PdfReader(pdf_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
            
            if not extracted_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from PDF. Is it a scanned image PDF?")
                
            medical_prompt = f"""
            You are 'Sehat-Sathi AI', a precise medical diagnostic report assistant.
            Analyze this extracted medical report text and output strictly as a JSON object matching the schema below.
            
            CRITICAL RULES:
            1. Extract the EXACT patient name from the header fields (e.g., Patient Information Name). Do NOT use names of signing doctors like Dr. Purvish Darji, Dr. Tejaswini Dhote, or Dr. Yash Shah.
            2. Do NOT write any code blocks or markdown wrappers.
            
            Return exactly this structure: {MEDICAL_OUTPUT_STRUCTURE}
            
            Extracted Text:
            {extracted_text}
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=medical_prompt,
                config=types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json")
            )
            
        # B. If File is an Image (PNG / JPEG)
        elif content_type in ["image/png", "image/jpeg", "image/jpg"]:
            is_image = True
            image_part = types.Part.from_bytes(
                data=file_bytes,
                mime_type=content_type
            )
            
            medical_prompt = f"""
            You are 'Sehat-Sathi AI', a precise medical diagnostic report assistant.
            Analyze the medical report provided in this image and output strictly as a JSON object matching the schema below.
            
            CRITICAL RULES:
            1. Look carefully at the 'Patient Name' field. Do NOT mistake doctor signatures or lab personnel for the patient.
            2. Output must be raw structured JSON only.
            
            Return exactly this structure: {MEDICAL_OUTPUT_STRUCTURE}
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[image_part, medical_prompt],
                config=types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json")
            )
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format! Please upload PDF or PNG/JPEG images.")

        clean_json_output = json.loads(response.text)
        
        # Save to Database
        db = get_db()
        report_document = {
            "user_id": user_id,
            "filename": file.filename,
            "raw_text": extracted_text if not is_image else "Analyzed via Image Vision",
            "ai_analysis": clean_json_output,
            "created_at": datetime.utcnow()
        }
        result = await db["reports"].insert_one(report_document)
        
        return {
            "status": "success",
            "report_id": str(result.inserted_id),
            "filename": file.filename,
            "model_used": "gemini-2.5-flash (Vision Mode)" if is_image else "gemini-2.5-flash (PDF Mode)",
            "data": clean_json_output
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File Processing Engine Error: {str(e)}"
        )


# --- 3. EXISTING HISTORY ENDPOINT ---
@router.get("/history")
async def get_user_report_history(current_user: dict = Depends(verify_token)):
    try:
        user_id = current_user.get("sub")
        db = get_db()
        cursor = db["reports"].find({"user_id": user_id}).sort("created_at", -1)
        reports = await cursor.to_list(length=100)
        
        for r in reports:
            r["_id"] = str(r["_id"])
            if "created_at" in r:
                r["created_at"] = r["created_at"].strftime("%Y-%m-%d %H:%M:%S")
                
        return {"status": "success", "total_reports": len(reports), "history": reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Secure History Fetch Error: {str(e)}")