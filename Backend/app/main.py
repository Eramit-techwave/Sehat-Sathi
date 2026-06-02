from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Internal Architecture Imports
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, reports # 🌟 Clean single line import for both routers
from app.config import settings

# 🚀 INITIALIZE FASTAPI APP ENGINE
app = FastAPI(
    title="SehatSathi Mesh API Engine",
    description="Automated Clinical Multimodal Vision Extraction Backend Pipeline",
    version="1.0.0"
)

# 🌐 CORS MIDDLEWARE CONFIGURATION (Saves from Browser Block)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # React Frontend dev URL
    allow_credentials=True,
    allow_methods=["*"], # Allow all standard protocols (POST, GET, OPTIONS etc.)
    allow_headers=["*"], # Allow all configuration validation headers
)

# 🛰️ LIFECYCLE EVENT HANDLERS
@app.on_event("startup")
async def startup_db_client():
    # Load hook setups and trigger cloud communication linkage
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    # Break ongoing pipelines cleanly on server execution termination
    await close_mongo_connection()

# 🔌 CONNECT AUTHENTICATION ROUTER NODE
app.include_router(auth.router)

# 🔬 CONNECT NEURAL EXTRACTION ROUTER NODE
app.include_router(reports.router) # 🌟 Added real-time report router mapping here

# 🗺️ BASE SANITY CHECK ROUTE
@app.get("/", tags=["Sanity Root Check"])
def root_check():
    return {
        "status": "online",
        "framework": "FastAPI Asynchronous Grid",
        "database_target": settings.DATABASE_NAME
    }