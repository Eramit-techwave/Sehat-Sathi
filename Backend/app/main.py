from fastapi import FastAPI
from app.database import connect_to_mongo, close_mongo_connection
from app.routes.auth import router as auth_router
# 1. Naya Import: AI Analyzer router ko import kiya
from app.routes.analyzer import router as analyzer_router

app = FastAPI(
    title="Sehat-Sathi Backend API",
    description="Production-ready FastAPI backend with MongoDB Atlas and Gemini AI Integration.",
    version="1.0.0"
)

# Lifespan events database connectivity ke liye
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Root test endpoint
@app.on_event("startup")
def welcome_message():
    print("🚀 Sehat-Sathi Application layer initialized successfully!")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to Sehat-Sathi Backend API System!"}

# 2. Routers Integration
app.include_router(auth_router)
app.include_router(analyzer_router) # Naya Router include kiya