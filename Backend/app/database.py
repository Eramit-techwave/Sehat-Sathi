from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
db = None
users_collection = None
reports_collection = None # 1. Naya handler reports ke liye

async def connect_to_mongo():
    global client, db, users_collection, reports_collection
    try:
        client = AsyncIOMotorClient(settings.MONGO_URI)
        db = client[settings.DB_NAME]
        users_collection = db["users"]
        reports_collection = db["reports"] # 2. Reports table ko map kiya
        print("✅ Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed.")