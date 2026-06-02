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
        
        # 🌟 JSON structure ke curly braces ko double ({{ }}) kar diya hai taaki f-string crash na kare
        system_ai_prompt = f"""
        You are an expert AI Medical Consultant. Analyze the attached lab report and perform two tasks:
        1. Extract all biomarkers into a structured table, including their normal reference ranges.
        2. Generate a high-level clinical summary highlighting critical anomalies.

        You MUST return the output strictly as a valid JSON object without markdown or backticks.

        Structure:
        {{
          "extracted_vitals": {{"metabolic": "1850 kcal", "cardio": "72 bpm", "confidence": "99.5%"}},
          "ai_consultant_summary": {{
            "status_headline": "Headline summary",
            "critical_findings": "High/Low description",
            "recommendations": "Actionable lifestyle or dietary advice"
          }},
          "parameters_table": [
            {{"name": "Biomarker Name", "value": "141.0 mg/dL", "normal_range": "70 - 100 mg/dL", "status": "High", "issue_description": "Context"}}
          ]
        }}
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

# ── 🌟 REAL-TIME LIVE AI CHAT ROUTE (CRISP & FRIENDLY CONVERSATION NODE) ──
@router.post("/chat-report")
async def chat_with_report(payload: ChatRequest):
    try:
        # Safeguard key mapping to align with Frontend State architecture
        context_data = payload.report_context.get("raw_parameters", payload.report_context)
        context_string = json.dumps(context_data, indent=2)
        
        chat_prompt = f"""
        You are a super cool, friendly, and empathetic AI health friend named 'Sehat-Sathi'.
        Act like a close friend, buddy, or a chilling personal health coach who talks directly to the patient in crisp, short, and natural Hinglish.

        Here is the Patient's Medical Report Data for your context:
        {context_string}
        
        Patient's Question: "{payload.message}"
        
        STRICT RULES FOR YOUR RESPONSE:
        1. Keep your answer VERY SHORT, CRISP, and DIRECT (Maximum 3 to 5 lines). Absolutely NO long lectures or massive essay lists!
        2. Speak in a natural conversational mix of Hindi and English (Hinglish), exactly how friends chat with each other on WhatsApp.
        3. Never repeat the whole report summary or list every single issue again if the user asks a small specific question. Just answer that specific point straight away.
        4. If they ask about diets (e.g., "kya khaye", "kya nahi khaye"), give exactly 2-3 specific main items directly based on their parameters. (e.g., "Bhai, sugar high hai toh meetha aur refined carbs bilkul touch mat karo!").
        5. Use cool emojis naturally, keep it human, comforting, and highly engaging. Do not use robotic terms like 'database node' or 'ledger matrix'.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=chat_prompt
        )
        
        return {"response": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat Error: {str(e)}")