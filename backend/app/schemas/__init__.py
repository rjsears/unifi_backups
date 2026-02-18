# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Pydantic Schemas
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

from app.schemas.backup import Backup, BackupCreate, BackupList
from app.schemas.device import Device, DeviceCreate, DeviceUpdate
from app.schemas.schedule import Schedule, ScheduleCreate, ScheduleUpdate
from app.schemas.settings import Settings, SettingsUpdate, StorageStats
from app.schemas.user import Token, TokenRefresh, User, UserCreate, UserLogin, UserUpdate

__all__ = [
    "User",
    "UserCreate",
    "UserLogin",
    "UserUpdate",
    "Token",
    "TokenRefresh",
    "Device",
    "DeviceCreate",
    "DeviceUpdate",
    "Backup",
    "BackupCreate",
    "BackupList",
    "Schedule",
    "ScheduleCreate",
    "ScheduleUpdate",
    "Settings",
    "SettingsUpdate",
    "StorageStats",
]
