#!/bin/bash
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Backend Entrypoint
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

set -e

echo "Starting UniFi Backup Manager API..."

# Wait for database to be ready
echo "Waiting for database..."
max_attempts=30
attempt=0
while [[ $attempt -lt $max_attempts ]]; do
    if python -c "
import asyncio
from sqlalchemy import text
from app.database import engine

async def check():
    async with engine.connect() as conn:
        await conn.execute(text('SELECT 1'))
        return True

try:
    asyncio.run(check())
    exit(0)
except:
    exit(1)
" 2>/dev/null; then
        echo "Database is ready!"
        break
    fi
    echo "Database not ready, waiting... (attempt $((attempt+1))/$max_attempts)"
    sleep 2
    ((attempt++))
done

if [[ $attempt -eq $max_attempts ]]; then
    echo "Error: Database connection timeout"
    exit 1
fi

# Run database migrations (when alembic is set up)
# echo "Running database migrations..."
# alembic upgrade head

# Initialize database tables
echo "Initializing database tables..."
python -c "
import asyncio
from app.database import init_db
asyncio.run(init_db())
print('Database tables initialized!')
"

# Create initial admin user if credentials are provided
if [[ -n "$ADMIN_PASSWORD" ]]; then
    echo "Checking for admin user..."
    python -m app.init_admin || true
fi

# Start the application
echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
