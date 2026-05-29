from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import connect_to_mongo, close_mongo_connection
# 1. Auth router ko import kar rahe hain jo humne routes/auth.py me banaya hai
from app.routes.auth import router as auth_router

# Lifespan manager jo startup aur shutdown events handle karta hai
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- STARTUP EVENT ----
    await connect_to_mongo()
    
    yield  # Yahan app chal rahi hai...
    
    # ---- SHUTDOWN EVENT ----
    await close_mongo_connection()

# FastAPI application instance
app = FastAPI(
    title="Sehat Sathi API",
    description="AI Powered Medical Lab Report Analyzer & Health Tracker Backend",
    version="1.0",
    lifespan=lifespan
)

# 2. Router ko Application me include kar rahe hain
app.include_router(auth_router)

# Home route testing ke liye
@app.get("/")
def home():
    return {
        "status": "success",
        "message": "Welcome to Sehat Sathi Backend API!",
        "version": "1.0"
    }