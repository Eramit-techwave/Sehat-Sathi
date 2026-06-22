from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Internal Architecture Imports
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, reports, users, appointments, doctors, donors
from app.config import settings

# 🚀 INITIALIZE FASTAPI APP ENGINE
app = FastAPI(
    title="SehatSathi Mesh API Engine",
    description="Automated Clinical Multimodal Vision Extraction Backend Pipeline",
    version="2.0.0"
)

# 🌐 CORS MIDDLEWARE CONFIGURATION
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
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
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(users.router)
app.include_router(appointments.router)
app.include_router(doctors.router)
app.include_router(donors.router)

# 🗺️ BASE SANITY CHECK ROUTE
@app.get("/", tags=["Sanity Root Check"])
def root_check():
    return {
        "status": "online",
        "framework": "FastAPI Asynchronous Grid",
        "version": "2.0.0",
        "database_target": settings.DATABASE_NAME
    }