from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Internal Architecture Imports
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, reports, users, appointments, doctors, donors
from app.routes import admin, notifications, hospitals
from app.config import settings

# 🚀 INITIALIZE FASTAPI APP ENGINE
app = FastAPI(
    title="SehatSathi Mesh API Engine",
    description="Automated Clinical Multimodal Vision Extraction Backend Pipeline — v3.0",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 🌐 CORS MIDDLEWARE CONFIGURATION
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://sehat-sathi-bay.vercel.app",
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🛰️ LIFECYCLE EVENT HANDLERS
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# 🔌 CONNECT ROUTERS
# Core Auth & User Routes
app.include_router(auth.router)
app.include_router(users.router)

# Medical Features
app.include_router(reports.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(donors.router)

# Platform Management (NEW)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(hospitals.router)

# 📁 STATIC FILES — Profile Photos
_photos_dir = os.path.join(os.path.dirname(__file__), "..", "stored_reports", "profile_photos")
os.makedirs(_photos_dir, exist_ok=True)
app.mount("/static/photos", StaticFiles(directory=_photos_dir), name="profile_photos")

# 🗺️ BASE SANITY CHECK ROUTE
@app.get("/", tags=["Sanity Root Check"])
def root_check():
    return {
        "status": "online",
        "framework": "FastAPI Asynchronous Grid",
        "version": "3.0.0",
        "database_target": settings.DATABASE_NAME,
        "security": "RBAC v2 — Admin self-signup blocked",
        "features": [
            "Role-Based Auth (Patient/Doctor/Hospital/Admin)",
            "Doctor & Hospital Verification Workflow",
            "In-App Notification System",
            "Double-Booking Prevention",
            "AI Report Analysis",
            "Hospital Public Discovery",
            "Admin Control Panel"
        ]
    }