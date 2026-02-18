# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
# UniFi Backup Manager - Auth Router Tests
# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

import pytest
from httpx import AsyncClient

from app.models.user import User
from app.services.auth_service import AuthService


class TestLoginEndpoint:
    """Tests for POST /api/auth/login endpoint."""

    @pytest.mark.asyncio
    async def test_login_success(self, async_client: AsyncClient, test_user: User):
        """Valid credentials should return tokens."""
        response = await async_client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "testpassword123"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client: AsyncClient, test_user: User):
        """Wrong password should return 401."""
        response = await async_client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "wrongpassword"},
        )

        assert response.status_code == 401
        assert "Invalid username or password" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client: AsyncClient):
        """Nonexistent user should return 401."""
        response = await async_client.post(
            "/api/auth/login",
            json={"username": "nobody", "password": "password"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_inactive_user(self, async_client: AsyncClient, test_db):
        """Inactive user should return 401."""
        # Create inactive user
        user = User(
            username="inactive",
            email="inactive@example.com",
            password_hash=AuthService.hash_password("password123"),
            is_active=False,
        )
        test_db.add(user)
        await test_db.commit()

        response = await async_client.post(
            "/api/auth/login",
            json={"username": "inactive", "password": "password123"},
        )

        assert response.status_code == 401


class TestRefreshEndpoint:
    """Tests for POST /api/auth/refresh endpoint."""

    @pytest.mark.asyncio
    async def test_refresh_success(self, async_client: AsyncClient, test_user: User):
        """Valid refresh token should return new tokens."""
        refresh_token = AuthService.create_refresh_token(data={"sub": str(test_user.id)})

        response = await async_client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, async_client: AsyncClient):
        """Invalid refresh token should return 401."""
        response = await async_client.post(
            "/api/auth/refresh",
            json={"refresh_token": "invalid.token.here"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_with_access_token_fails(
        self, async_client: AsyncClient, test_user: User
    ):
        """Using access token as refresh should return 401."""
        access_token = AuthService.create_access_token(data={"sub": str(test_user.id)})

        response = await async_client.post(
            "/api/auth/refresh",
            json={"refresh_token": access_token},
        )

        assert response.status_code == 401
        assert "Invalid token type" in response.json()["detail"]


class TestMeEndpoint:
    """Tests for GET /api/auth/me endpoint."""

    @pytest.mark.asyncio
    async def test_me_authenticated(
        self, async_client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Authenticated user should get their info."""
        response = await async_client.get("/api/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert "password_hash" not in data

    @pytest.mark.asyncio
    async def test_me_unauthenticated(self, async_client: AsyncClient):
        """Unauthenticated request should return 401."""
        response = await async_client.get("/api/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_invalid_token(self, async_client: AsyncClient):
        """Invalid token should return 401."""
        response = await async_client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid.token"},
        )

        assert response.status_code == 401


class TestPasswordChangeEndpoint:
    """Tests for PUT /api/auth/password endpoint."""

    @pytest.mark.asyncio
    async def test_change_password_success(
        self, async_client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Valid password change should succeed."""
        response = await async_client.put(
            "/api/auth/password",
            headers=auth_headers,
            json={
                "current_password": "testpassword123",
                "new_password": "newpassword456",
            },
        )

        assert response.status_code == 200
        assert "successfully" in response.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_change_password_wrong_current(
        self, async_client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Wrong current password should return 400."""
        response = await async_client.put(
            "/api/auth/password",
            headers=auth_headers,
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword456",
            },
        )

        assert response.status_code == 400
        assert "incorrect" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_change_password_unauthenticated(self, async_client: AsyncClient):
        """Unauthenticated request should return 401."""
        response = await async_client.put(
            "/api/auth/password",
            json={
                "current_password": "password",
                "new_password": "newpassword",
            },
        )

        assert response.status_code == 401


class TestLogoutEndpoint:
    """Tests for POST /api/auth/logout endpoint."""

    @pytest.mark.asyncio
    async def test_logout_success(
        self, async_client: AsyncClient, test_user: User, auth_headers: dict
    ):
        """Logout should return success message."""
        response = await async_client.post("/api/auth/logout", headers=auth_headers)

        assert response.status_code == 200
        assert "successfully" in response.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_logout_unauthenticated(self, async_client: AsyncClient):
        """Unauthenticated logout should return 401."""
        response = await async_client.post("/api/auth/logout")

        assert response.status_code == 401
