# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Auth Service Tests
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

from datetime import UTC, datetime, timedelta

import pytest

from app.services.auth_service import AuthService


class TestPasswordHashing:
    """Tests for password hashing functionality."""

    def test_hash_password_returns_hash(self):
        """Hash should return a bcrypt hash string."""
        password = "testpassword123"
        hashed = AuthService.hash_password(password)

        assert hashed is not None
        assert hashed != password
        assert hashed.startswith("$2b$")  # bcrypt prefix

    def test_hash_password_different_each_time(self):
        """Same password should produce different hashes (due to salt)."""
        password = "testpassword123"
        hash1 = AuthService.hash_password(password)
        hash2 = AuthService.hash_password(password)

        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Correct password should verify successfully."""
        password = "testpassword123"
        hashed = AuthService.hash_password(password)

        assert AuthService.verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Incorrect password should fail verification."""
        password = "testpassword123"
        hashed = AuthService.hash_password(password)

        assert AuthService.verify_password("wrongpassword", hashed) is False

    def test_verify_password_empty(self):
        """Empty password should fail verification."""
        password = "testpassword123"
        hashed = AuthService.hash_password(password)

        assert AuthService.verify_password("", hashed) is False


class TestJWTTokens:
    """Tests for JWT token creation and validation."""

    def test_create_access_token(self):
        """Access token should be created with correct claims."""
        data = {"sub": "123"}
        token = AuthService.create_access_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_custom_expiry(self):
        """Access token should respect custom expiry."""
        data = {"sub": "123"}
        expires = timedelta(minutes=5)
        token = AuthService.create_access_token(data, expires_delta=expires)

        payload = AuthService.decode_token(token)
        assert payload is not None
        assert payload["type"] == "access"

    def test_create_refresh_token(self):
        """Refresh token should be created with correct claims."""
        data = {"sub": "123"}
        token = AuthService.create_refresh_token(data)

        assert token is not None
        assert isinstance(token, str)

        payload = AuthService.decode_token(token)
        assert payload is not None
        assert payload["type"] == "refresh"

    def test_decode_valid_access_token(self):
        """Valid access token should decode successfully."""
        data = {"sub": "123"}
        token = AuthService.create_access_token(data)

        payload = AuthService.decode_token(token)

        assert payload is not None
        assert payload["sub"] == "123"
        assert payload["type"] == "access"
        assert "exp" in payload

    def test_decode_valid_refresh_token(self):
        """Valid refresh token should decode successfully."""
        data = {"sub": "456"}
        token = AuthService.create_refresh_token(data)

        payload = AuthService.decode_token(token)

        assert payload is not None
        assert payload["sub"] == "456"
        assert payload["type"] == "refresh"

    def test_decode_invalid_token(self):
        """Invalid token should return None."""
        payload = AuthService.decode_token("invalid.token.here")

        assert payload is None

    def test_decode_malformed_token(self):
        """Malformed token should return None."""
        payload = AuthService.decode_token("not-a-jwt")

        assert payload is None

    def test_decode_empty_token(self):
        """Empty token should return None."""
        payload = AuthService.decode_token("")

        assert payload is None

    def test_token_contains_subject(self):
        """Token should preserve subject claim."""
        user_id = "user-12345"
        token = AuthService.create_access_token({"sub": user_id})
        payload = AuthService.decode_token(token)

        assert payload["sub"] == user_id

    def test_access_and_refresh_tokens_are_different(self):
        """Access and refresh tokens for same data should be different."""
        data = {"sub": "123"}
        access_token = AuthService.create_access_token(data)
        refresh_token = AuthService.create_refresh_token(data)

        assert access_token != refresh_token
