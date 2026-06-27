from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
db = None
users_collection = None
reports_collection = None

def get_db():
    """Direct database instance handler."""
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
    return client[settings.DATABASE_NAME]

async def connect_to_mongo():
    """Global initialization with all collection setup and indexes."""
    global client, db, users_collection, reports_collection
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        users_collection = db["users"]
        reports_collection = db["reports"]

        # ─────────────────────────────────────────────────────────────
        # INDEXES FOR PERFORMANCE & DATA INTEGRITY
        # ─────────────────────────────────────────────────────────────

        # Unique email index for users
        await db["users"].create_index([("email", 1)], unique=True)

        # Double-booking prevention: unique compound index (Doctor + Date + Slot)
        # Only applies to non-cancelled appointments
        await db["appointments"].create_index(
            [("doctor_id", 1), ("date", 1), ("time_slot", 1)],
            unique=True,
            partialFilterExpression={"status": {"$ne": "Cancelled"}}
        )

        # Appointment lookup indexes
        await db["appointments"].create_index([("patient_id", 1), ("date", -1)])
        await db["appointments"].create_index([("doctor_id", 1), ("date", -1)])
        await db["appointments"].create_index([("hospital_id", 1), ("date", -1)])

        # Doctor lookup indexes
        await db["doctors"].create_index([("user_id", 1)], unique=True)
        await db["doctors"].create_index([("verification_status", 1)])
        await db["doctors"].create_index([("hospital_id", 1)])

        # Hospital lookup indexes
        await db["hospitals"].create_index([("user_id", 1)], unique=True)
        await db["hospitals"].create_index([("verification_status", 1)])
        await db["hospitals"].create_index([("is_publicly_listed", 1)])

        # Notifications indexes: fast per-user fetch, unread-first sorting
        await db["notifications"].create_index([("user_id", 1), ("is_read", 1), ("created_at", -1)])
        await db["notifications"].create_index([("user_id", 1), ("created_at", -1)])

        # Reports lookup
        await db["reports"].create_index([("patient_id", 1), ("uploaded_at", -1)])

        # Donors lookup
        await db["donors"].create_index([("bloodGroup", 1), ("city", 1)])

        # Connection verification ping
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas Cloud Database!")
        print("✅ All collection indexes initialized.")
    except Exception as e:
        print(f"❌ MongoDB Atlas cloud connection has been failed: {e}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed securely.")