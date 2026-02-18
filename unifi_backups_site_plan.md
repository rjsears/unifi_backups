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
| SQLite | 3.x | Database (default) |

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
│   │   │   ├── device.py               # UniFi device model
│   │   │   ├── backup.py               # Backup record model
│   │   │   ├── schedule.py             # Backup schedule model
│   │   │   └── settings.py             # System settings model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── device.py               # Device Pydantic schemas
│   │   │   ├── backup.py               # Backup Pydantic schemas
│   │   │   ├── schedule.py             # Schedule Pydantic schemas
│   │   │   └── settings.py             # Settings Pydantic schemas
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── devices.py              # Device CRUD endpoints
│   │   │   ├── backups.py              # Backup management endpoints
│   │   │   ├── schedules.py            # Schedule management endpoints
│   │   │   ├── settings.py             # Settings endpoints
│   │   │   └── storage.py              # Storage stats endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
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
│   │   │   ├── index.js                # Axios instance
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
│   │   │   ├── DashboardView.vue       # Main dashboard
│   │   │   ├── DevicesView.vue         # Device management
│   │   │   ├── BackupsView.vue         # Backup browser
│   │   │   ├── SchedulesView.vue       # Schedule management
│   │   │   └── SettingsView.vue        # System settings
│   │   ├── stores/
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

### devices
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR(100) | Display name |
| ip_address | VARCHAR(45) | Device IP |
| api_key | VARCHAR(255) | Encrypted API key |
| device_type | VARCHAR(50) | UDM-Pro, USG, etc. |
| model | VARCHAR(100) | Model identifier |
| firmware_version | VARCHAR(50) | Current firmware |
| mac_address | VARCHAR(17) | MAC address |
| is_active | BOOLEAN | Enabled for backups |
| last_seen | DATETIME | Last successful connection |
| created_at | DATETIME | Record creation |
| updated_at | DATETIME | Last update |

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
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
    container_name: unifi-backup-api
    volumes:
      - ./backend:/app
      - backup_data:/backups
      - ./data:/data
    environment:
      - DATABASE_URL=sqlite:///data/unifi_backups.db
      - BACKUP_PATH=/backups
      - DEBUG=true
    ports:
      - "8000:8000"
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
```

### docker-compose.prod.yaml (Production)
```yaml
version: '3.8'

services:
  backend:
    image: rjsears/unifi-backup-api:latest
    container_name: unifi-backup-api
    volumes:
      - backup_data:/backups
      - db_data:/data
    environment:
      - DATABASE_URL=sqlite:///data/unifi_backups.db
      - BACKUP_PATH=/backups
      - DEBUG=false
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
  db_data:
    driver: local
```

### Environment Variables
```bash
# Backend
DATABASE_URL=sqlite:///data/unifi_backups.db
BACKUP_PATH=/backups
SECRET_KEY=your-secret-key-here
DEBUG=false
LOG_LEVEL=INFO

# Frontend
VITE_API_URL=http://localhost:8000

# Optional: NFS mount (host configuration)
# Mount NFS to /backups before starting container
```

---

## GitHub Actions Workflows

### lint.yml
```yaml
name: Lint & Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
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

      - name: Run ruff
        run: ruff check app/

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

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  frontend-build:
    name: Frontend Build
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

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
```

### docker-publish.yml
```yaml
name: Build and Publish Docker Images

on:
  push:
    branches:
      - main
    tags:
      - 'v*.*.*'
  workflow_dispatch:

env:
  REGISTRY: docker.io
  DOCKER_HUB_USERNAME: rjsears

jobs:
  lint:
    uses: ./.github/workflows/lint.yml

  build-backend:
    name: Build Backend Image
    runs-on: ubuntu-latest
    needs: lint
    if: github.event_name != 'pull_request'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ env.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.DOCKER_HUB_USERNAME }}/unifi-backup-api
          tags: |
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
            type=semver,pattern={{version}}
            type=sha,prefix=sha-

      - name: Build and push
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

  build-frontend:
    name: Build Frontend Image
    runs-on: ubuntu-latest
    needs: lint
    if: github.event_name != 'pull_request'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ env.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.DOCKER_HUB_USERNAME }}/unifi-backup-frontend
          tags: |
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
            type=semver,pattern={{version}}
            type=sha,prefix=sha-

      - name: Build and push
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

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: [build-backend, build-frontend]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.DOCKER_HUB_USERNAME }}/unifi-backup-api:latest
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v4
        if: always()
        continue-on-error: true
        with:
          sarif_file: 'trivy-results.sarif'
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

1. **API Key Storage**: Encrypt API keys at rest using Fernet
2. **Session Management**: Secure cookie handling for UniFi sessions
3. **Input Validation**: Pydantic schemas for all inputs
4. **File Downloads**: Validate backup file paths to prevent directory traversal
5. **CORS**: Restrict to frontend origin in production
6. **Rate Limiting**: Prevent backup spam
7. **Secrets Management**: Environment variables, never in code

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
*Version: 1.4*