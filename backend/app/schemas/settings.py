# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Settings Schemas
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

from pydantic import BaseModel


class Settings(BaseModel):
    """Schema for system settings response."""

    backup_path: str
    default_retention_days: int


class SettingsUpdate(BaseModel):
    """Schema for updating settings."""

    backup_path: str | None = None
    default_retention_days: int | None = None


class DeviceStorageStats(BaseModel):
    """Storage stats for a single device."""

    device_id: int
    device_name: str
    backup_count: int
    total_size: int  # bytes


class StorageStats(BaseModel):
    """Schema for storage statistics."""

    backup_path: str
    total_space: int  # bytes
    used_space: int  # bytes
    free_space: int  # bytes
    usage_percent: float
    total_backups: int
    by_device: list[DeviceStorageStats]
