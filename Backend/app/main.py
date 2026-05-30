from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # CORS import kiya
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, analyzer

app = FastAPI(
    title="Sehat-Sathi Backend Engine",
    description="Production-ready secure AI medical diagnostic analyzer API",
    version="1.0.0"
)

# 🔐 CORS MIDDLEWARE SETUP
# Yeh security layer React app (jo localhost:5173 par chalegi) ko backend se baat karne ki permission deti hai
origins = [
    "http://localhost:5173",     # React local development URL
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Sirf hamare frontend ko allow karega
    allow_credentials=True,
    allow_methods=["*"],             # Saare methods (GET, POST, OPTIONS, etc.) allowed hain
    allow_headers=["*"],             # Saare headers (Authorization, Content-Type, etc.) allowed hain
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Routers ko include kiya
app.include_router(auth.router)
app.include_router(analyzer.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to Sehat-Sathi Secure Core AI Engine API Layer."
    }