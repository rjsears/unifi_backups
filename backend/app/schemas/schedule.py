# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Schedule Schemas
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class ScheduleBase(BaseModel):
    """Base schedule schema."""

    device_id: int
    name: str = Field(..., min_length=1, max_length=100)
    cron_expression: str | None = None
    interval_hours: int | None = Field(None, ge=1, le=720)  # Max 30 days
    retention_days: int = Field(default=30, ge=1, le=365)

    @model_validator(mode="after")
    def validate_schedule_type(self):
        """Ensure either cron_expression or interval_hours is set."""
        if not self.cron_expression and not self.interval_hours:
            raise ValueError("Either cron_expression or interval_hours must be provided")
        if self.cron_expression and self.interval_hours:
            raise ValueError("Only one of cron_expression or interval_hours should be provided")
        return self


class ScheduleCreate(ScheduleBase):
    """Schema for creating a schedule."""

    pass


class ScheduleUpdate(BaseModel):
    """Schema for updating a schedule."""

    name: str | None = Field(None, min_length=1, max_length=100)
    cron_expression: str | None = None
    interval_hours: int | None = Field(None, ge=1, le=720)
    retention_days: int | None = Field(None, ge=1, le=365)
    is_enabled: bool | None = None


class Schedule(BaseModel):
    """Schema for schedule response."""

    id: int
    device_id: int
    name: str
    cron_expression: str | None
    interval_hours: int | None
    retention_days: int
    is_enabled: bool
    last_run: datetime | None
    next_run: datetime | None
    created_at: datetime
    updated_at: datetime

    # Computed
    device_name: str | None = None

    model_config = {"from_attributes": True}
