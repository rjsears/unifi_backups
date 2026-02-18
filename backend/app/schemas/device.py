# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Device Schemas
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

from datetime import datetime

from pydantic import BaseModel, Field, IPvAnyAddress


class DeviceBase(BaseModel):
    """Base device schema."""

    name: str = Field(..., min_length=1, max_length=100)
    ip_address: str = Field(..., description="Device IP address")
    device_type: str = Field(..., description="Device type (UDM-Pro, USG, etc.)")


class DeviceCreate(DeviceBase):
    """Schema for creating a device."""

    api_key: str = Field(..., min_length=1, description="UniFi API key (will be encrypted)")


class DeviceUpdate(BaseModel):
    """Schema for updating a device."""

    name: str | None = Field(None, min_length=1, max_length=100)
    ip_address: str | None = None
    api_key: str | None = Field(None, description="New API key (will be encrypted)")
    device_type: str | None = None
    is_active: bool | None = None


class DeviceStatus(BaseModel):
    """Schema for device status from UniFi API."""

    is_online: bool
    uptime: int | None = None  # seconds
    firmware_version: str | None = None
    model: str | None = None
    mac_address: str | None = None
    last_backup: datetime | None = None
    backup_count: int = 0


class Device(DeviceBase):
    """Schema for device response."""

    id: int
    model: str | None
    firmware_version: str | None
    mac_address: str | None
    is_active: bool
    last_seen: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeviceWithStatus(Device):
    """Schema for device with live status."""

    status: DeviceStatus | None = None
