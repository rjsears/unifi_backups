# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Backup Schemas
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

from datetime import date, datetime

from pydantic import BaseModel


class BackupBase(BaseModel):
    """Base backup schema."""

    device_id: int
    backup_type: str = "manual"  # manual, scheduled


class BackupCreate(BackupBase):
    """Schema for creating a backup (triggering)."""

    pass


class Backup(BaseModel):
    """Schema for backup response."""

    id: int
    device_id: int
    filename: str
    file_path: str
    file_size: int
    backup_type: str
    status: str
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    # Computed fields
    device_name: str | None = None

    model_config = {"from_attributes": True}


class BackupList(BaseModel):
    """Schema for paginated backup list."""

    items: list[Backup]
    total: int
    page: int
    page_size: int
    pages: int


class BackupCalendarDay(BaseModel):
    """Schema for calendar day with backup count."""

    date: date
    count: int


class BackupCalendar(BaseModel):
    """Schema for calendar response."""

    days: list[BackupCalendarDay]
    month: int
    year: int
