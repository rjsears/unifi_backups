# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Configuration Tests
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import os

import pytest

from app.config import Settings, get_settings


class TestSettings:
    """Tests for application settings."""

    def test_default_settings(self):
        """Settings should have sensible defaults."""
        settings = Settings()

        assert settings.jwt_algorithm == "HS256"
        assert settings.jwt_access_token_expire_minutes == 30
        assert settings.jwt_refresh_token_expire_days == 7
        assert settings.debug is False
        assert settings.log_level == "INFO"

    def test_backup_path_has_value(self):
        """Backup path should have a value (default or from env)."""
        settings = Settings()
        assert settings.backup_path is not None
        assert len(settings.backup_path) > 0

    def test_cors_origins_default(self):
        """CORS origins should have localhost defaults."""
        settings = Settings()
        assert "http://localhost:5173" in settings.cors_origins
        assert "http://localhost:3000" in settings.cors_origins

    def test_get_settings_returns_instance(self):
        """get_settings should return a Settings instance."""
        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_get_settings_cached(self):
        """get_settings should return the same cached instance."""
        settings1 = get_settings()
        settings2 = get_settings()
        assert settings1 is settings2


class TestSettingsFromEnvironment:
    """Tests for loading settings from environment variables."""

    def test_debug_from_env(self, monkeypatch):
        """Debug setting should be loadable from env."""
        monkeypatch.setenv("DEBUG", "true")
        # Need to create new instance to pick up env var
        settings = Settings()
        assert settings.debug is True

    def test_log_level_from_env(self, monkeypatch):
        """Log level should be loadable from env."""
        monkeypatch.setenv("LOG_LEVEL", "DEBUG")
        settings = Settings()
        assert settings.log_level == "DEBUG"

    def test_jwt_expire_from_env(self, monkeypatch):
        """JWT expiry should be loadable from env."""
        monkeypatch.setenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
        settings = Settings()
        assert settings.jwt_access_token_expire_minutes == 60
