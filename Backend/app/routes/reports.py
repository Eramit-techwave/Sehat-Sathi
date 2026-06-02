from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
import json
import os
from google import genai
from google.genai import types
from app.config import settings

router = APIRouter(prefix="/api", tags=["Neural Extraction Layer"])
client = genai.Client(api_key=settings.PARSER_API_KEY)

# ── 🌟 CHAT REQUEST SCHEMALAYER ──
class ChatRequest(BaseModel):
    message: str
    report_context: dict

@router.post("/extract-report")
async def extract_report(file: UploadFile = File(...)):
    allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only PDF and images are accepted.")
        
    try:
        file_bytes = await file.read()
        
        system_ai_prompt = """
        You are an expert AI Medical Consultant. Analyze the attached lab report and perform two tasks:
        1. Extract all biomarkers into a structured table, including their normal reference ranges.
        2. Generate a high-level clinical summary highlighting critical anomalies.

        You MUST return the output strictly as a valid JSON object without markdown or backticks.

        Structure:
        {
          "extracted_vitals": {"metabolic": "1850 kcal", "cardio": "72 bpm", "confidence": "99.5%"},
          "ai_consultant_summary": {
            "status_headline": "Headline summary",
            "critical_findings": "High/Low description",
            "recommendations": "Actionable lifestyle or dietary advice"
          },
          "parameters_table": [
            {"name": "Biomarker Name", "value": "141.0 mg/dL", "normal_range": "70 - 100 mg/dL", "status": "High", "issue_description": "Context"}
          ]
        }
        """

        print("🧠 Triggering Gemini Neural Analysis Hub...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type=file.content_type),
                system_ai_prompt
            ]
        )
        
        # ── ✅ FIXED: CLEAN SINGLE LINE STRING SPLITTERS ──
        clean_json_string = response.text.strip()
        if "```json" in clean_json_string:
            clean_json_string = clean_json_string.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json_string:
            clean_json_string = clean_json_string.split("```")[1].split("```")[0].strip()

        return json.loads(clean_json_string)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── 🌟 REAL-TIME LIVE AI CHAT ROUTE ──
@router.post("/chat-report")
async def chat_with_report(payload: ChatRequest):
    try:
        # Safeguard key mapping to align with Frontend State architecture
        context_data = payload.report_context.get("raw_parameters", payload.report_context)
        context_string = json.dumps(context_data, indent=2)
        
        chat_prompt = f"""
        You are an empathetic, expert AI Medical Doctor chatbot named 'Sehat-Sathi Consultant'. 
        You are talking directly to the patient in a friendly Hinglish/English mix tone.
        
        Here is the Patient's Medical Report Data:
        {context_string}
        
        Patient's Question: "{payload.message}"
        
        Instructions:
        1. Answer the patient's question accurately using the provided report data context.
        2. Speak in a natural conversational mix of Hindi and English (Hinglish), just like a real tech-savvy Indian doctor talking to a patient.
        3. If they ask about diets (e.g., "kya khaye", "vitamin d kam h to kya kare"), give specific food recommendations based on their High/Low parameters.
        4. Do not use complex system words like 'database node', 'payload', or 'ledger matrix'. Keep it human, precise and encouraging.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=chat_prompt
        )
        
        return {"response": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat Error: {str(e)}")