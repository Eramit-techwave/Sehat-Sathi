from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# 1. MongoDB Client initialize kar rahe hain URI ke sath
# Humne config se settings.MONGO_URI uthaya hai jo .env se aa raha hai
client = AsyncIOMotorClient(settings.MONGO_URI)

# 2. Database ka reference le rahe hain
db = client[settings.DB_NAME]

# 3. Connection test karne ke liye ek function bana rahe hain
async def connect_to_mongo():
    try:
        # admin database par command chala kar check kar rahe hain ki connection live hai ya nahi
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

# 4. Connection close karne ke liye function
async def close_mongo_connection():
    client.close()
    print("🔌 MongoDB connection closed.")