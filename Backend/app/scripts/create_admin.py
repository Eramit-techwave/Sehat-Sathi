"""
Admin Account Creation Script
==============================
Usage:
    cd Backend
    python -m app.scripts.create_admin

This script creates a secure Admin account in the database.
It CANNOT be triggered via the public API — this is by design.
"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime

# Import settings from the app config
sys.path.insert(0, ".")

try:
    from app.config import settings
except ImportError:
    print("❌ Cannot import settings. Run this script from the Backend/ directory.")
    sys.exit(1)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_admin(email: str, password: str, name: str):
    print(f"\n🔐 SehatSathi Admin Creator")
    print(f"{'─' * 40}")

    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    try:
        # Check if admin already exists
        existing = await db["users"].find_one({"email": email})
        if existing:
            current_role = existing.get("role", "Unknown")
            if current_role == "Admin":
                print(f"✅ Admin account already exists: {email}")
            else:
                print(f"⚠️  Email {email} exists with role '{current_role}'. Cannot overwrite.")
                return

        hashed_pwd = pwd_context.hash(password)
        admin_doc = {
            "name": name,
            "email": email,
            "password": hashed_pwd,
            "role": "Admin",
            "phone": None,
            "created_at": datetime.now(),
            "is_active": True,
            "verification_status": "approved",
            "_created_by": "create_admin_script"
        }
        result = await db["users"].insert_one(admin_doc)
        print(f"✅ Admin account created successfully!")
        print(f"   Name : {name}")
        print(f"   Email: {email}")
        print(f"   ID   : {result.inserted_id}")
        print(f"\n⚠️  Keep these credentials secure. Do not share them.\n")

    except Exception as e:
        print(f"❌ Error creating admin: {e}")
    finally:
        client.close()


def main():
    print("\n🏥 SehatSathi — Admin Account Setup")
    print("=" * 40)

    name = input("Admin Full Name: ").strip()
    if not name:
        name = "Super Admin"

    email = input("Admin Email: ").strip()
    if not email or "@" not in email:
        print("❌ Invalid email address.")
        sys.exit(1)

    import getpass
    password = getpass.getpass("Admin Password (min 8 chars): ")
    if len(password) < 8:
        print("❌ Password must be at least 8 characters.")
        sys.exit(1)

    confirm = getpass.getpass("Confirm Password: ")
    if password != confirm:
        print("❌ Passwords do not match.")
        sys.exit(1)

    asyncio.run(create_admin(email, password, name))


if __name__ == "__main__":
    main()
