from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
db = None
users_collection = None
reports_collection = None

def get_db():
    """Naye analyzer ke liye direct database instance handler"""
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
    return client[settings.DATABASE_NAME]

async def connect_to_mongo():
    """Purane auth.py aur main.py ke liye global initialization"""
    global client, db, users_collection, reports_collection
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        users_collection = db["users"]
        reports_collection = db["reports"]
        
        # Connection verification ping
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas Cloud Database!")
    except Exception as e:
        print(f"❌ MongoDB Atlas cloud connection failed: {e}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed securely.")