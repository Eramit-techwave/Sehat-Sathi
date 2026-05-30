from fastapi import APIRouter, HTTPException, status, Depends
from google import genai
from google.genai import types
from app.config import settings
from app.database import get_db
from app.routes.auth import get_current_user # 1. Secure auth middleware ko import kiya
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter(
    prefix="/analyze",
    tags=["AI Report Analyzer & History"]
)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# 🎯 CHANGED: Ab hume body me user_id lene ki bilkul zaroorat nahi hai!
class ReportInput(BaseModel):
    report_text: str

@router.post("/text")
async def analyze_report_text(data: ReportInput, current_user: str = Depends(get_current_user)):
    """
    Ab ye endpoint secured hai. Bina valid JWT Token ke koi ise hit nahi kar payega.
    'current_user' ke andar automatic login wale user ka email aa jayega.
    """
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
        
        db = get_db()
        reports_collection = db["reports"]
        
        # 2. Database Document me ab static ID ki jagah login user ka email save hoga
        report_document = {
            "user_id": current_user, # Securely fetched from Token!
            "raw_text": data.report_text,
            "ai_analysis": clean_json_output,
            "created_at": datetime.utcnow()
        }
        
        result = await reports_collection.insert_one(report_document)
        
        return {
            "status": "success",
            "report_id": str(result.inserted_id),
            "model_used": "gemini-2.5-flash (JWT Protected)",
            "data": clean_json_output
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI/DB Secure Error: {str(e)}"
        )

@router.get("/history") # 🎯 CHANGED: URL se bhi {user_id} hata diya, ab ye automatic chalega
async def get_user_report_history(current_user: str = Depends(get_current_user)):
    """
    User ko koi ID nahi deni padegi. Jis user ka token hoga, 
    database se sirf USI ka data filter hoke aayega. 100% Secure!
    """
    try:
        db = get_db()
        reports_collection = db["reports"]
        
        # Jo user logged in hai, sirf uski reports find karo
        cursor = reports_collection.find({"user_id": current_user}).sort("created_at", -1)
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
            detail=f"Secure History Fetch Error: {str(e)}"
        )
        