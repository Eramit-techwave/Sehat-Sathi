from fastapi import APIRouter, HTTPException, status
from google import genai
from google.genai import types
from app.config import settings
from app.database import get_db # 1. Naya function import kiya
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter(
    prefix="/analyze",
    tags=["AI Report Analyzer & History"]
)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class ReportInput(BaseModel):
    user_id: str 
    report_text: str

@router.post("/text")
async def analyze_report_text(data: ReportInput):
    try:
        medical_prompt = f"""
        You are 'Sehat-Sathi AI'. Analyze this medical report text and output strictly as a JSON object.
        Do NOT write any introduction or conclusion. Do NOT use markdown code blocks like ```json.
        Return exactly this structure:
        {{
            "patient_name": "string or Unknown",
            "summary": "one simple sentence explaining the overall report",
            "parameters": [
                {{
                    "name": "Parameter Name",
                    "value": "Value with unit",
                    "status": "NORMAL or WARNING or CRITICAL",
                    "explanation": "Simple common-man explanation",
                    "finding": "What is wrong or right"
                }}
            ],
            "recommendations": {{
                "diet": ["bullet point 1"],
                "lifestyle": ["bullet point 1"]
            }},
            "disclaimer": "Medical disclaimer text"
        }}

        Raw Report Text:
        {data.report_text}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=medical_prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json" 
            )
        )
        
        clean_json_output = json.loads(response.text)
        
        # 2. Direct Function se database aur 'reports' collection fetch kiya
        db = get_db()
        reports_collection = db["reports"]
        
        report_document = {
            "user_id": data.user_id,
            "raw_text": data.report_text,
            "ai_analysis": clean_json_output,
            "created_at": datetime.utcnow()
        }
        
        # 3. Insert into database
        result = await reports_collection.insert_one(report_document)
        
        return {
            "status": "success",
            "report_id": str(result.inserted_id),
            "model_used": "gemini-2.5-flash (JSON + Saved)",
            "data": clean_json_output
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI/DB Error: {str(e)}"
        )

@router.get("/history/{user_id}")
async def get_user_report_history(user_id: str):
    try:
        # 4. Yahan bhi function ka use kiya
        db = get_db()
        reports_collection = db["reports"]
        
        cursor = reports_collection.find({"user_id": user_id}).sort("created_at", -1)
        reports = await cursor.to_list(length=100)
        
        for r in reports:
            r["_id"] = str(r["_id"])
            if "created_at" in r:
                r["created_at"] = r["created_at"].strftime("%Y-%m-%d %H:%M:%S")
                
        return {
            "status": "success",
            "total_reports": len(reports),
            "history": reports
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"History Fetch Error: {str(e)}"
        )