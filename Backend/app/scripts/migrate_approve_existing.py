"""
Migration: Approve existing Doctors and Hospitals
===================================================
Run once after deploying the verification system to avoid breaking
existing accounts that were created before verification was added.

Usage:
    cd Backend
    python -m app.scripts.migrate_approve_existing

Effect:
    - Sets verification_status="approved" for all doctors where field is missing
    - Sets verification_status="approved" for all hospitals where field is missing
    - Does NOT overwrite explicitly set pending/rejected statuses
"""
import asyncio
import sys

sys.path.insert(0, ".")

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    from app.config import settings
except ImportError:
    print("❌ Run this from the Backend/ directory.")
    sys.exit(1)


async def migrate():
    print("\n🔄 SehatSathi — Migration: Approve Existing Accounts")
    print("=" * 50)

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    try:
        # Only update where verification_status field doesn't exist yet
        doc_result = await db["doctors"].update_many(
            {"verification_status": {"$exists": False}},
            {"$set": {"verification_status": "approved", "kyc_status": "verified", "migrated": True}}
        )
        hosp_result = await db["hospitals"].update_many(
            {"verification_status": {"$exists": False}},
            {"$set": {
                "verification_status": "approved",
                "is_publicly_listed": True,
                "bed_availability": {"general": True, "icu": True, "emergency": True},
                "bed_counts": {"general": 0, "icu": 0, "emergency": 0},
                "announcements": [],
                "migrated": True
            }}
        )

        print(f"✅ Doctors approved: {doc_result.modified_count}")
        print(f"✅ Hospitals approved: {hosp_result.modified_count}")
        print("\nMigration complete. Existing users are now approved.")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(migrate())
