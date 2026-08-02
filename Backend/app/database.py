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
        try:
            # Unique email index for users
            await db["users"].create_index([("email", 1)], unique=True)

            # Double-booking prevention: unique compound index (Doctor + Date + Slot)
            await db["appointments"].create_index(
                [("doctor_id", 1), ("date", 1), ("time_slot", 1)],
                unique=True,
                partialFilterExpression={"status": {"$in": ["Pending", "Confirmed", "Completed", "Scheduled", "Active", "Booked"]}}
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

            # ── V2 INDEXES ────────────────────────────────────────────────

            # Prescriptions: fast lookup by doctor/patient, sorted by created_at
            await db["prescriptions"].create_index([("doctor_id", 1), ("created_at", -1)])
            await db["prescriptions"].create_index([("patient_id", 1), ("created_at", -1)])
            await db["prescriptions"].create_index([("appointment_id", 1)])

            # Follow-ups: sorted by due_date for reminder queries
            await db["follow_ups"].create_index([("patient_id", 1), ("due_date", 1)])
            await db["follow_ups"].create_index([("doctor_id", 1), ("due_date", 1)])
            await db["follow_ups"].create_index([("patient_id", 1), ("status", 1)])

            # Queue entries: fast daily queue lookup
            await db["queue_entries"].create_index([("hospital_id", 1), ("date", 1), ("position", 1)])
            await db["queue_entries"].create_index([("patient_id", 1), ("date", 1)])

            # Lab orders: doctor → patient lookup
            await db["lab_orders"].create_index([("doctor_id", 1), ("created_at", -1)])
            await db["lab_orders"].create_index([("patient_id", 1), ("created_at", -1)])
            await db["lab_orders"].create_index([("status", 1)])

            # Referrals: incoming + outgoing per doctor
            await db["referrals"].create_index([("referring_doctor_id", 1), ("created_at", -1)])
            await db["referrals"].create_index([("referred_to_doctor_id", 1), ("status", 1)])
            await db["referrals"].create_index([("patient_id", 1), ("created_at", -1)])
        except Exception as idx_err:
            print(f"[INFO] Index setup note: {idx_err}")

        # Connection verification ping
        await client.admin.command('ping')
        print("[SUCCESS] Connected to MongoDB Atlas Cloud Database!")
        print("[SUCCESS] All collection indexes initialized.")
    except Exception as e:
        print(f"[ERROR] MongoDB Atlas cloud connection failed: {e}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("[SUCCESS] MongoDB connection closed securely.")