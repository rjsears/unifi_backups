# UniFi Backup Manager - Complete Project Plan

## Project Overview

A web-based application for managing backups of UniFi network devices. The system provides a clean, modern interface for viewing device status, triggering manual backups, scheduling automated backups, browsing backup history with a calendar picker, and managing backup storage.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Vue 3 | ^3.4.x | Reactive UI framework |
| Vite | ^5.x | Build tool and dev server |
| Tailwind CSS | ^3.4.x | Utility-first styling |
| Pinia | ^2.1.x | State management |
| Vue Router | ^4.3.x | Client-side routing |
| Heroicons | ^2.1.x | Icon library |
| date-fns | ^3.x | Date manipulation and formatting |
| axios | ^1.6.x | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | ^0.109.x | API framework |
| SQLAlchemy | ^2.0.x | ORM |
| Pydantic | ^2.x | Data validation |
| APScheduler | ^3.10.x | Background job scheduling |
| aiohttp | ^3.9.x | Async HTTP for UniFi API |
| PostgreSQL | 15+ | Database |
| asyncpg | ^0.29.x | Async PostgreSQL driver |
| python-jose | ^3.3.x | JWT token handling |
| passlib | ^1.7.x | Password hashing (bcrypt) |
| cryptography | ^42.x | API key encryption (Fernet) |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy (production) |
| GitHub Actions | CI/CD pipeline |

---

## Project Structure

```
unifi_backups/
├── .github/
│   └── workflows/
│       ├── lint.yml                    # Linting (Ruff + ESLint)
│       └── docker-publish.yml          # Docker Hub publishing
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application entry
│   │   ├── config.py                   # Configuration management
│   │   ├── database.py                 # Database connection/session
│   │   ├── dependencies.py             # FastAPI dependencies
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py                 # User account model
│   │   │   ├── device.py               # UniFi device model
│   │   │   ├── backup.py               # Backup record model
│   │   │   ├── schedule.py             # Backup schedule model
│   │   │   └── settings.py             # System settings model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py                 # User/Auth Pydantic schemas
│   │   │   ├── device.py               # Device Pydantic schemas
│   │   │   ├── backup.py               # Backup Pydantic schemas
│   │   │   ├── schedule.py             # Schedule Pydantic schemas
│   │   │   └── settings.py             # Settings Pydantic schemas
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                 # Authentication endpoints
│   │   │   ├── devices.py              # Device CRUD endpoints
│   │   │   ├── backups.py              # Backup management endpoints
│   │   │   ├── schedules.py            # Schedule management endpoints
│   │   │   ├── settings.py             # Settings endpoints
│   │   │   └── storage.py              # Storage stats endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py         # Authentication & JWT handling
│   │   │   ├── crypto_service.py       # API key encryption/decryption
│   │   │   ├── unifi_client.py         # UniFi API client
│   │   │   ├── backup_service.py       # Backup logic
│   │   │   ├── scheduler_service.py    # APScheduler management
│   │   │   └── storage_service.py      # Storage monitoring
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py              # Utility functions
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_devices.py
│   │   ├── test_backups.py
│   │   └── test_schedules.py
│   ├── alembic/                        # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── pyproject.toml                  # Ruff configuration
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── device-images/              # UniFi device images
│   │       ├── udm-pro.png
│   │       ├── udm-se.png
│   │       ├── usg.png
│   │       ├── usw.png
│   │       ├── uap.png
│   │       └── generic.png
│   ├── src/
│   │   ├── main.js                     # Vue app entry
│   │   ├── App.vue                     # Root component
│   │   ├── style.css                   # Global styles + Tailwind
│   │   ├── api/
│   │   │   ├── index.js                # Axios instance with JWT interceptor
│   │   │   ├── auth.js                 # Login/logout API calls
│   │   │   ├── devices.js              # Device API calls
│   │   │   ├── backups.js              # Backup API calls
│   │   │   ├── schedules.js            # Schedule API calls
│   │   │   └── settings.js             # Settings API calls
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue       # Top navigation
│   │   │   │   ├── AppSidebar.vue      # Side navigation
│   │   │   │   └── AppFooter.vue       # Footer
│   │   │   ├── dashboard/
│   │   │   │   ├── DeviceCard.vue      # Device info card
│   │   │   │   ├── DeviceStats.vue     # Uptime/status display
│   │   │   │   └── StorageWidget.vue   # Storage overview
│   │   │   ├── backups/
│   │   │   │   ├── BackupList.vue      # Backup list view
│   │   │   │   ├── BackupCard.vue      # Individual backup card
│   │   │   │   ├── BackupCalendar.vue  # Calendar date picker
│   │   │   │   └── BackupModal.vue     # Backup details popup
│   │   │   ├── devices/
│   │   │   │   ├── AddDeviceModal.vue  # Add device form
│   │   │   │   └── EditDeviceModal.vue # Edit device form
│   │   │   ├── schedules/
│   │   │   │   ├── ScheduleForm.vue    # Schedule configuration
│   │   │   │   └── ScheduleList.vue    # Active schedules
│   │   │   └── ui/
│   │   │       ├── BaseButton.vue      # Reusable button
│   │   │       ├── BaseCard.vue        # Reusable card
│   │   │       ├── BaseModal.vue       # Reusable modal
│   │   │       ├── LoadingSpinner.vue  # Loading indicator
│   │   │       └── ToastNotification.vue # Notifications
│   │   ├── views/
│   │   │   ├── LoginView.vue           # Login page
│   │   │   ├── DashboardView.vue       # Main dashboard
│   │   │   ├── DevicesView.vue         # Device management
│   │   │   ├── BackupsView.vue         # Backup browser
│   │   │   ├── SchedulesView.vue       # Schedule management
│   │   │   └── SettingsView.vue        # System settings
│   │   ├── stores/
│   │   │   ├── auth.js                 # Auth state & JWT handling
│   │   │   ├── devices.js              # Device state
│   │   │   ├── backups.js              # Backup state
│   │   │   ├── schedules.js            # Schedule state
│   │   │   └── settings.js             # Settings state
│   │   └── router/
│   │       └── index.js                # Vue Router config
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf                      # Production nginx config
├── docker-compose.yaml                 # Development compose
├── docker-compose.prod.yaml            # Production compose
├── .env.example                        # Environment template
├── .gitignore
├── LICENSE
└── README.md
```

---

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| username | VARCHAR(50) | Unique username |
| email | VARCHAR(255) | Email address |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| is_active | BOOLEAN | Account enabled |
| is_admin | BOOLEAN | Admin privileges |
| last_login | TIMESTAMP | Last login time |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### devices
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR(100) | Display name |
| ip_address | VARCHAR(45) | Device IP |
| api_key_encrypted | TEXT | Fernet-encrypted API key |
| device_type | VARCHAR(50) | UDM-Pro, USG, etc. |
| model | VARCHAR(100) | Model identifier |
| firmware_version | VARCHAR(50) | Current firmware |
| mac_address | VARCHAR(17) | MAC address |
| is_active | BOOLEAN | Enabled for backups |
| last_seen | TIMESTAMP | Last successful connection |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

### backups
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| device_id | INTEGER | FK to devices |
| filename | VARCHAR(255) | Backup filename |
| file_path | VARCHAR(500) | Full path to backup |
| file_size | BIGINT | Size in bytes |
| backup_type | VARCHAR(20) | manual/scheduled |
| status | VARCHAR(20) | pending/running/completed/failed |
| error_message | TEXT | Error details if failed |
| started_at | DATETIME | Backup start time |
| completed_at | DATETIME | Backup completion time |
| created_at | DATETIME | Record creation |

### schedules
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| device_id | INTEGER | FK to devices |
| name | VARCHAR(100) | Schedule name |
| cron_expression | VARCHAR(100) | Cron schedule |
| interval_hours | INTEGER | Alternative: every N hours |
| retention_days | INTEGER | Days to keep backups |
| is_enabled | BOOLEAN | Schedule active |
| last_run | DATETIME | Last execution |
| next_run | DATETIME | Next scheduled run |
| created_at | DATETIME | Record creation |
| updated_at | DATETIME | Last update |

### settings
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| key | VARCHAR(100) | Setting key |
| value | TEXT | Setting value (JSON) |
| updated_at | DATETIME | Last update |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Authenticate user, returns JWT |
| POST | /api/auth/logout | Invalidate current token |
| GET | /api/auth/me | Get current user info |
| POST | /api/auth/refresh | Refresh JWT token |
| PUT | /api/auth/password | Change password |

### Devices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/devices | List all devices |
| GET | /api/devices/{id} | Get device details |
| POST | /api/devices | Add new device |
| PUT | /api/devices/{id} | Update device |
| DELETE | /api/devices/{id} | Remove device |
| GET | /api/devices/{id}/status | Get live device stats |
| POST | /api/devices/{id}/test | Test device connection |

### Backups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/backups | List all backups (with filters) |
| GET | /api/backups/{id} | Get backup details |
| POST | /api/backups/{device_id}/now | Trigger immediate backup |
| DELETE | /api/backups/{id} | Delete backup |
| GET | /api/backups/{id}/download | Download backup file |
| GET | /api/backups/calendar | Get backup dates for calendar |
| GET | /api/backups/by-date/{date} | Get backups for specific date |

### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/schedules | List all schedules |
| GET | /api/schedules/{id} | Get schedule details |
| POST | /api/schedules | Create schedule |
| PUT | /api/schedules/{id} | Update schedule |
| DELETE | /api/schedules/{id} | Delete schedule |
| POST | /api/schedules/{id}/toggle | Enable/disable schedule |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Get all settings |
| PUT | /api/settings | Update settings |
| GET | /api/settings/storage | Get storage stats |

---

## UniFi API Integration

### Authentication
The UniFi Controller uses session-based authentication with cookies:

```python
# Login endpoint
POST /api/login
{
    "username": "admin",
    "password": "password",
    "remember": true
}

# Verify session
GET /api/self
```

### Device Information
```python
# Get all devices
GET /api/s/{site}/stat/device

# Get specific device
GET /api/s/{site}/stat/device/{mac}

# Get device stats
GET /api/s/{site}/stat/device/{mac}/stats

# Get site health
GET /api/s/{site}/stat/health
```

### Backup Operations
```python
# Create backup
POST /api/s/{site}/cmd/backup
{"cmd": "backup"}

# List backups
POST /api/s/{site}/cmd/backup
{"cmd": "list-backups"}

# Download backup
GET /dl/autobackup/{filename}

# Delete backup
POST /api/s/{site}/cmd/backup
{"cmd": "delete-backup", "filename": "backup_file.unf"}
```

### Important Notes
- API key authentication may require UniFi OS 3.0+ (UDM-Pro, UDM-SE, Dream Machine)
- Older controllers may require username/password authentication
- Super Administrator role required for backup operations
- Site name defaults to "default" but can vary

---

## UI/UX Design Specifications

### Color Palette (Dark Theme - Matching Reference Projects)
```css
/* Primary colors */
--bg-primary: #0f172a;      /* Slate 900 */
--bg-secondary: #1e293b;    /* Slate 800 */
--bg-card: #334155;         /* Slate 700 */
--bg-hover: #475569;        /* Slate 600 */

/* Accent colors */
--accent-primary: #3b82f6;  /* Blue 500 */
--accent-success: #22c55e;  /* Green 500 */
--accent-warning: #f59e0b;  /* Amber 500 */
--accent-danger: #ef4444;   /* Red 500 */

/* Text colors */
--text-primary: #f8fafc;    /* Slate 50 */
--text-secondary: #94a3b8;  /* Slate 400 */
--text-muted: #64748b;      /* Slate 500 */

/* Border colors */
--border-default: #475569;  /* Slate 600 */
--border-focus: #3b82f6;    /* Blue 500 */
```

### Device Card Layout
```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐                                               │
│  │  Device  │   UDM-Pro                          ● Online   │
│  │  Image   │   192.168.1.1                                 │
│  │          │                                               │
│  └──────────┘   Uptime: 45d 12h 30m                        │
│                 Firmware: 3.2.7                             │
│                 Last Backup: 2 hours ago                    │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Backup Now    │  │  Review Backups │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐                                        │
│  │    Schedule     │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Backup Review Panel (Expanded Below Card)
```
┌─────────────────────────────────────────────────────────────┐
│  Recent Backups                                    [Close]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  backup_2024-02-16_143022.unf                       │   │
│  │  Feb 16, 2024 at 2:30 PM  •  125.4 MB  •  Scheduled │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  backup_2024-02-15_143015.unf                       │   │
│  │  Feb 15, 2024 at 2:30 PM  •  124.8 MB  •  Scheduled │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ... (up to 10 recent backups)                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          📅  Browse All Backups by Date             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Calendar Picker (Similar to unifi_timelapse)
```
┌─────────────────────────────────────────────────────────────┐
│  ◀  February 2024  ▶                                        │
├─────────────────────────────────────────────────────────────┤
│  Sun   Mon   Tue   Wed   Thu   Fri   Sat                   │
│                           1     2     3                     │
│   4     5     6     7     8     9    10                     │
│  11   [12]  [13]  [14]  [15]  [16]   17   ← Highlighted    │
│  18    19    20    21    22    23    24      days have     │
│  25    26    27    28    29                   backups      │
└─────────────────────────────────────────────────────────────┘
```

### Backup Detail Modal
```
┌─────────────────────────────────────────────────────────────┐
│                    Backup Details                     [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Filename:    backup_udmpro_2024-02-16_143022.unf         │
│   Device:      UDM-Pro (192.168.1.1)                       │
│   Date:        February 16, 2024                           │
│   Time:        2:30:22 PM                                  │
│   Size:        125.4 MB                                    │
│   Type:        Scheduled                                   │
│   Status:      ✓ Completed                                 │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              ⬇  Download Backup                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Storage Widget
```
┌─────────────────────────────────────────────────────────────┐
│  Storage Overview                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████░░░░░░░░░░░░░░░░░░  45% Used          │
│                                                             │
│  Used: 45.2 GB of 100 GB                                   │
│  Free: 54.8 GB                                             │
│  Total Backups: 156                                        │
│                                                             │
│  By Device:                                                │
│  • UDM-Pro: 52 backups (25.1 GB)                          │
│  • USW-48: 48 backups (12.3 GB)                           │
│  • UAP-AC-Pro: 56 backups (7.8 GB)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Docker Configuration

### docker-compose.yaml (Development)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: unifi-backup-db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=unifi_backup
      - POSTGRES_PASSWORD=changeme_dev
      - POSTGRES_DB=unifi_backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U unifi_backup -d unifi_backups"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
    container_name: unifi-backup-api
    volumes:
      - ./backend:/app
      - backup_data:/backups
    environment:
      - DATABASE_URL=postgresql+asyncpg://unifi_backup:changeme_dev@db:5432/unifi_backups
      - BACKUP_PATH=/backups
      - SECRET_KEY=dev-secret-key-change-in-production
      - FERNET_KEY=your-fernet-key-here
      - DEBUG=true
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/frontend.Dockerfile
    container_name: unifi-backup-frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  backup_data:
    driver: local
  postgres_data:
    driver: local
```

### docker-compose.prod.yaml (Production)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: unifi-backup-db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=unifi_backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d unifi_backups"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: rjsears/unifi-backup-api:latest
    container_name: unifi-backup-api
    volumes:
      - backup_data:/backups
    environment:
      - DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/unifi_backups
      - BACKUP_PATH=/backups
      - SECRET_KEY=${SECRET_KEY}
      - FERNET_KEY=${FERNET_KEY}
      - DEBUG=false
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: rjsears/unifi-backup-frontend:latest
    container_name: unifi-backup-frontend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: unifi-backup-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  backup_data:
    driver: local
  postgres_data:
    driver: local
```

### Environment Variables
```bash
# Database (PostgreSQL)
POSTGRES_USER=unifi_backup
POSTGRES_PASSWORD=your-secure-password-here
DATABASE_URL=postgresql+asyncpg://unifi_backup:password@db:5432/unifi_backups

# Backend
BACKUP_PATH=/backups
DEBUG=false
LOG_LEVEL=INFO

# Authentication (JWT)
SECRET_KEY=your-jwt-secret-key-here          # Used for signing JWT tokens
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# API Key Encryption (Fernet)
FERNET_KEY=your-fernet-key-here              # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Frontend
VITE_API_URL=http://localhost:8000

# Optional: NFS mount (host configuration)
# Mount NFS to /backups before starting container
```

---

## GitHub Actions Workflows

### ci.yml (Lint, Test & Build)
```yaml
name: CI - Lint, Test & Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # ============================================================================
  # Backend: Lint with Ruff
  # ============================================================================
  backend-lint:
    name: Backend Lint (Ruff)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install ruff
        run: pip install ruff

      - name: Run ruff linter
        run: ruff check app/

      - name: Run ruff formatter check
        run: ruff format --check app/

  # ============================================================================
  # Backend: Unit & Integration Tests with pytest
  # ============================================================================
  backend-test:
    name: Backend Tests (pytest)
    runs-on: ubuntu-latest
    needs: backend-lint
    defaults:
      run:
        working-directory: backend

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_unifi_backups
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Cache pip dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('backend/requirements*.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run pytest with coverage
        env:
          DATABASE_URL: postgresql+asyncpg://test_user:test_password@localhost:5432/test_unifi_backups
          SECRET_KEY: test-secret-key
          FERNET_KEY: test-fernet-key-32-bytes-long-xx=
          BACKUP_PATH: /tmp/test_backups
        run: |
          pytest tests/ \
            --cov=app \
            --cov-report=xml \
            --cov-report=term-missing \
            --cov-fail-under=70 \
            -v

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./backend/coverage.xml
          flags: backend
          name: backend-coverage
          fail_ci_if_error: false

  # ============================================================================
  # Frontend: Lint with ESLint
  # ============================================================================
  frontend-lint:
    name: Frontend Lint (ESLint)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  # ============================================================================
  # Frontend: Unit Tests with Vitest
  # ============================================================================
  frontend-test:
    name: Frontend Tests (Vitest)
    runs-on: ubuntu-latest
    needs: frontend-lint
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run Vitest
        run: npm run test:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage
          fail_ci_if_error: false

  # ============================================================================
  # Frontend: Build Check
  # ============================================================================
  frontend-build:
    name: Frontend Build
    runs-on: ubuntu-latest
    needs: [frontend-lint, frontend-test]
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist
          retention-days: 7

  # ============================================================================
  # All CI Checks Passed (used as branch protection requirement)
  # ============================================================================
  ci-success:
    name: CI Success
    runs-on: ubuntu-latest
    needs: [backend-lint, backend-test, frontend-lint, frontend-test, frontend-build]
    if: always()
    steps:
      - name: Check all jobs passed
        run: |
          if [[ "${{ needs.backend-lint.result }}" != "success" ]] || \
             [[ "${{ needs.backend-test.result }}" != "success" ]] || \
             [[ "${{ needs.frontend-lint.result }}" != "success" ]] || \
             [[ "${{ needs.frontend-test.result }}" != "success" ]] || \
             [[ "${{ needs.frontend-build.result }}" != "success" ]]; then
            echo "One or more CI jobs failed"
            exit 1
          fi
          echo "All CI checks passed!"
```

### docker-publish.yml (Build & Push to Docker Hub)
```yaml
name: Build and Publish Docker Images

on:
  push:
    branches:
      - main
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      tag:
        description: 'Tag to build (e.g., v1.0.0 or latest)'
        required: false
        default: 'latest'

env:
  REGISTRY: docker.io
  IMAGE_NAME_API: unifi-backup-api
  IMAGE_NAME_FRONTEND: unifi-backup-frontend

jobs:
  # ============================================================================
  # Run CI checks first
  # ============================================================================
  ci:
    name: Run CI Checks
    uses: ./.github/workflows/ci.yml

  # ============================================================================
  # Build and Push Backend API Image
  # ============================================================================
  build-backend:
    name: Build & Push Backend Image
    runs-on: ubuntu-latest
    needs: ci
    if: github.event_name != 'pull_request'
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
        with:
          platforms: linux/amd64,linux/arm64

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata for Backend
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_API }}
          tags: |
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=raw,value=${{ github.event.inputs.tag }},enable=${{ github.event_name == 'workflow_dispatch' }}
            type=sha,prefix=sha-
          labels: |
            org.opencontainers.image.title=UniFi Backup API
            org.opencontainers.image.description=Backend API for UniFi Backup Manager
            org.opencontainers.image.vendor=rjsears
            maintainer=rjsears

      - name: Build and push Backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./docker/backend.Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}
            VERSION=${{ steps.meta.outputs.version }}

      - name: Backend image digest
        run: echo "Backend image pushed with digest ${{ steps.meta.outputs.digest }}"

  # ============================================================================
  # Build and Push Frontend Image
  # ============================================================================
  build-frontend:
    name: Build & Push Frontend Image
    runs-on: ubuntu-latest
    needs: ci
    if: github.event_name != 'pull_request'
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
        with:
          platforms: linux/amd64,linux/arm64

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata for Frontend
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_FRONTEND }}
          tags: |
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=raw,value=${{ github.event.inputs.tag }},enable=${{ github.event_name == 'workflow_dispatch' }}
            type=sha,prefix=sha-
          labels: |
            org.opencontainers.image.title=UniFi Backup Frontend
            org.opencontainers.image.description=Web UI for UniFi Backup Manager
            org.opencontainers.image.vendor=rjsears
            maintainer=rjsears

      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./docker/frontend.Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}
            VERSION=${{ steps.meta.outputs.version }}

      - name: Frontend image digest
        run: echo "Frontend image pushed with digest ${{ steps.meta.outputs.digest }}"

  # ============================================================================
  # Security Scanning with Trivy
  # ============================================================================
  security-scan:
    name: Security Scan (Trivy)
    runs-on: ubuntu-latest
    needs: [build-backend, build-frontend]
    if: github.event_name != 'pull_request'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run Trivy on Backend image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_API }}:latest
          format: 'sarif'
          output: 'trivy-backend.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Run Trivy on Frontend image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_FRONTEND }}:latest
          format: 'sarif'
          output: 'trivy-frontend.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Backend Trivy results
        uses: github/codeql-action/upload-sarif@v4
        if: always()
        continue-on-error: true
        with:
          sarif_file: 'trivy-backend.sarif'
          category: 'trivy-backend'

      - name: Upload Frontend Trivy results
        uses: github/codeql-action/upload-sarif@v4
        if: always()
        continue-on-error: true
        with:
          sarif_file: 'trivy-frontend.sarif'
          category: 'trivy-frontend'

  # ============================================================================
  # Update Docker Hub README
  # ============================================================================
  update-dockerhub-readme:
    name: Update Docker Hub Description
    runs-on: ubuntu-latest
    needs: [build-backend, build-frontend]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Update Backend Docker Hub README
        uses: peter-evans/dockerhub-description@v4
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          repository: ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_API }}
          short-description: "UniFi Backup Manager - Backend API"
          readme-filepath: ./README.md

      - name: Update Frontend Docker Hub README
        uses: peter-evans/dockerhub-description@v4
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          repository: ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME_FRONTEND }}
          short-description: "UniFi Backup Manager - Web Frontend"
          readme-filepath: ./README.md
```

### Required GitHub Secrets

Configure these secrets in your repository settings (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (create at hub.docker.com → Account Settings → Security → New Access Token) |
| `CODECOV_TOKEN` | Codecov upload token (get from codecov.io after linking your repo) |

### Codecov Setup

1. Go to [codecov.io](https://codecov.io) and sign in with GitHub
2. Add your repository
3. Copy the upload token from the repository settings
4. Add it as `CODECOV_TOKEN` secret in GitHub

Codecov will then:
- Show coverage % on every PR as a comment
- Track coverage trends over time in a dashboard
- Flag files with decreased coverage
- Provide line-by-line coverage visualization

### Required npm Scripts (package.json)

Add these scripts to `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs",
    "lint:fix": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix",
    "test": "vitest",
    "test:ci": "vitest run --coverage"
  }
}
```

### Required pytest Configuration (pyproject.toml)

Add to `backend/pyproject.toml`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --tb=short"

[tool.coverage.run]
source = ["app"]
omit = ["app/tests/*", "app/__init__.py"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]
```

---

## Implementation Phases

### Phase 1: Project Foundation
**Estimated Scope: Backend scaffolding + basic frontend**

1. Initialize project structure
2. Set up backend with FastAPI
   - Database models (SQLAlchemy)
   - Basic CRUD endpoints
   - Configuration management
3. Set up frontend with Vue 3 + Vite + Tailwind
   - Base components (Button, Card, Modal)
   - Layout components (Header, Sidebar)
   - Router configuration
4. Docker development environment
5. Basic GitHub Actions (lint only)

### Phase 2: Device Management
**Estimated Scope: Device CRUD + UniFi integration**

1. UniFi API client service
   - Authentication handling
   - Device discovery
   - Connection testing
2. Device management UI
   - Add/Edit/Remove device modals
   - Device status polling
   - Connection status indicators
3. Device card component with live stats

### Phase 3: Backup Operations
**Estimated Scope: Manual backups + storage**

1. Backup service implementation
   - Trigger backup via UniFi API
   - Download and store backup files
   - Track backup metadata
2. "Backup Now" functionality
3. Backup list view
4. Backup detail modal with download
5. Storage stats service and widget

### Phase 4: Backup Browser & Calendar
**Estimated Scope: Calendar picker + backup history**

1. Calendar component (date-fns based)
   - Highlight dates with backups
   - Month navigation
2. Backup browser by date
3. Review Backups panel (expandable)
4. Recent backups list (last 10)

### Phase 5: Scheduling System
**Estimated Scope: APScheduler integration**

1. APScheduler service integration
2. Schedule CRUD operations
3. Schedule management UI
   - Interval selection (hourly, daily, custom)
   - Retention configuration
4. Schedule enable/disable toggle
5. Next run / last run tracking

### Phase 6: Polish & Production
**Estimated Scope: Production readiness**

1. Error handling and notifications
2. Loading states throughout UI
3. Production Docker configuration
4. Docker Hub publishing workflow
5. Documentation (README, install guide)
6. Security hardening
   - API key encryption
   - Input validation
   - Rate limiting

---

## Testing Strategy

### Backend Tests (pytest)
- Unit tests for services
- Integration tests for API endpoints
- Mock UniFi API responses

### Frontend Tests (Vitest)
- Component unit tests
- Store tests
- API integration tests (MSW)

### E2E Tests (Optional - Playwright)
- Critical user flows
- Backup workflow
- Device management

---

## Security Considerations

### User Authentication (JWT)
- **Login Flow**: User submits username/password → Backend verifies against bcrypt hash → Returns JWT access token + refresh token
- **Token Storage**: Access token stored in memory (Pinia store), refresh token in httpOnly cookie
- **Protected Routes**: Vue Router guards check for valid token before allowing access
- **Token Refresh**: Automatic refresh when access token expires (30 min default)
- **Password Storage**: Bcrypt with cost factor 12

### UniFi Device API Key Encryption
- **Encryption Method**: Fernet symmetric encryption (AES-128-CBC with HMAC)
- **Key Storage**: FERNET_KEY stored in environment variable, never in database
- **Workflow**:
  1. User adds device with API key via UI
  2. Backend encrypts API key: `fernet.encrypt(api_key.encode())`
  3. Encrypted key stored in `devices.api_key_encrypted` column
  4. When backup runs: `fernet.decrypt(encrypted_key).decode()`
  5. Decrypted key used for UniFi API call, then discarded from memory
- **Key Rotation**: Generate new FERNET_KEY, re-encrypt all device API keys via migration script

### Additional Security Measures
1. **Input Validation**: Pydantic schemas for all API inputs
2. **File Downloads**: Validate backup file paths to prevent directory traversal
3. **CORS**: Restrict to frontend origin in production
4. **Rate Limiting**: Prevent backup spam (10 backups/minute per device)
5. **Secrets Management**: All secrets via environment variables
6. **SQL Injection**: SQLAlchemy ORM with parameterized queries
7. **HTTPS**: Nginx terminates TLS in production

---

## References

### UniFi API Documentation
- [Ubiquiti Community Wiki](https://ubntwiki.com/products/software/unifi-controller/api)
- [UniFi Controller API Guide](https://github.com/uchkunrakhimow/unifi-controller-api-professional-guide)
- [Official UniFi API Getting Started](https://help.ui.com/hc/en-us/articles/30076656117076-Getting-Started-with-the-Official-UniFi-API)

### Reference Projects (Design Patterns)
- [unifi_timelapse](https://github.com/rjsears/unifi_timelapse) - Calendar picker, Vue 3 patterns
- [pizero_generator_control](https://github.com/rjsears/pizero_generator_control) - Full-stack structure, Docker workflows
- [n8n_nginx](https://github.com/rjsears/n8n_nginx) - Flask patterns, management UI

---

## Appendix: Device Type Images

The following UniFi device types should have corresponding images in `frontend/public/device-images/`:

| Device Type | Image File | Description |
|-------------|------------|-------------|
| UDM-Pro | udm-pro.png | Dream Machine Pro |
| UDM-SE | udm-se.png | Dream Machine SE |
| UDM | udm.png | Dream Machine |
| USG | usg.png | UniFi Security Gateway |
| USG-Pro | usg-pro.png | UniFi Security Gateway Pro |
| EFG | efg.png | Enterprise Fortress Gateway |
| UCK | uck.png | UniFi Cloud Key |
| UCK-G2 | uck-g2.png | UniFi Cloud Key Gen2 |
| UNVR-Pro | unvr-pro.png | UniFi NVR Pro |
| UNVR-Enterprise | unvr-enterprise.png | UniFi NVR Enterprise |

---

*Plan created: February 16, 2026*
*Last updated: February 18, 2026*
*Version: 1.8*