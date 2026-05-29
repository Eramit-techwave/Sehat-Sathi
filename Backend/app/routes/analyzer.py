from fastapi import APIRouter, HTTPException, status
from google import genai
from google.genai import types
from app.config import settings
from pydantic import BaseModel
import json  # String ko Python dictionary me badalne ke liye

router = APIRouter(
    prefix="/analyze",
    tags=["AI Report Analyzer"]
)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class ReportInput(BaseModel):
    report_text: str

@router.post("/text")
async def analyze_report_text(data: ReportInput):
    try:
        # Strict Prompt with required JSON structure
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
                    "explanation": "Simple common-man explanation of what this parameter does",
                    "finding": "What is wrong or right with this specific parameter"
                }}
            ],
            "recommendations": {{
                "diet": ["bullet point 1", "bullet point 2"],
                "lifestyle": ["bullet point 1", "bullet point 2"]
            }},
            "disclaimer": "Strict medical disclaimer text"
        }}

        Raw Report Text:
        {data.report_text}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=medical_prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                # AI ko force kar rahe hain JSON generate karne ke liye
                response_mime_type="application/json" 
            )
        )
        
        # Gemini ke string response ko pure Python JSON/Dictionary me parse kar rahe hain
        clean_json_output = json.loads(response.text)
        
        return {
            "status": "success",
            "model_used": "gemini-2.5-flash (Structured JSON Mode)",
            "data": clean_json_output
        }
        
    except json.JSONDecodeError:
        # Agar AI ne kabhi galat JSON bana diya toh safe recovery
        return {
            "status": "partial_success",
            "raw_analysis": response.text
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini JSON Error: {str(e)}"
        )