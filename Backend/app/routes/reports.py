from fastapi import APIRouter, UploadFile, File, HTTPException, status
import shutil
import os

router = APIRouter(prefix="/api", tags=["Neural Extraction Layer"])

# Target directory jahan safe archives records files build honge
UPLOAD_DIR = "stored_reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/extract-report")
async def extract_report(file: UploadFile = File(...)):
    # 1. Format verification index checking
    allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format matrix. Only PDF and images are accepted."
        )
        
    # 2. Local storage destination generation 
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        # 3. Writing the binary chunks safely from buffer to disk terminal
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 🌟 (Next Step: Yahan hum humare multimodal LLM algorithms execute karenge structure mapping ke liye)
        
        return {
            "success": True,
            "filename": file.filename,
            "status": "Ingested",
            "message": "Binary data stream allocated successfully inside system clusters."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline disruption during disk writing write operation: {str(e)}"
        )