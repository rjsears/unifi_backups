# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Initialize Admin User
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
#
# This script creates the initial admin user if one doesn't exist.
# Run with: python -m app.init_admin
#
# Environment variables:
#   ADMIN_USERNAME - Admin username (default: admin)
#   ADMIN_EMAIL - Admin email (default: admin@localhost)
#   ADMIN_PASSWORD - Admin password (required)
#
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import asyncio
import os
import sys

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.user import User
from app.services.auth_service import AuthService


async def create_initial_admin():
    """Create the initial admin user if one doesn't exist."""
    username = os.environ.get("ADMIN_USERNAME", "admin")
    email = os.environ.get("ADMIN_EMAIL", "admin@localhost")
    password = os.environ.get("ADMIN_PASSWORD")

    if not password:
        print("Error: ADMIN_PASSWORD environment variable is required")
        sys.exit(1)

    if len(password) < 8:
        print("Error: ADMIN_PASSWORD must be at least 8 characters")
        sys.exit(1)

    async with AsyncSessionLocal() as db:
        # Check if any admin user exists
        result = await db.execute(select(User).where(User.is_admin == True))  # noqa: E712
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"Admin user already exists: {existing_admin.username}")
            return

        # Check if username is taken
        result = await db.execute(select(User).where(User.username == username))
        if result.scalar_one_or_none():
            print(f"Error: Username '{username}' is already taken")
            sys.exit(1)

        # Create admin user
        user = await AuthService.create_user(
            db, username=username, email=email, password=password, is_admin=True
        )
        print(f"Admin user created successfully!")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")


if __name__ == "__main__":
    asyncio.run(create_initial_admin())
