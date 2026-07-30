"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient

# Mark all tests in this file as async
pytestmark = pytest.mark.asyncio


async def test_register_user(client: AsyncClient):
    """Test successful user registration."""
    response = await client.post(
        "/api/auth/register",
        json={"username": "testuser", "password": "password123", "full_name": "Test User"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["full_name"] == "Test User"
    assert "id" in data
    assert data["is_active"] is True


async def test_register_duplicate_user(client: AsyncClient):
    """Test registration with an existing username fails."""
    # Register first time
    await client.post(
        "/api/auth/register",
        json={"username": "testuser", "password": "password123"},
    )
    
    # Try again
    response = await client.post(
        "/api/auth/register",
        json={"username": "testuser", "password": "different_password"},
    )
    assert response.status_code == 409
    assert "already taken" in response.json()["detail"]


async def test_login_success(client: AsyncClient):
    """Test successful login returns access token and sets refresh cookie."""
    # Create user
    await client.post(
        "/api/auth/register",
        json={"username": "loginuser", "password": "password123"},
    )
    
    # Login
    response = await client.post(
        "/api/auth/login",
        data={"username": "loginuser", "password": "password123"}, # form data
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Check cookie
    assert "refresh_token" in response.cookies


async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with wrong password fails."""
    await client.post(
        "/api/auth/register",
        json={"username": "loginuser", "password": "password123"},
    )
    
    response = await client.post(
        "/api/auth/login",
        data={"username": "loginuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401


async def test_refresh_token(client: AsyncClient):
    """Test using refresh token to get a new access token."""
    await client.post(
        "/api/auth/register",
        json={"username": "refreshuser", "password": "password123"},
    )
    
    login_response = await client.post(
        "/api/auth/login",
        data={"username": "refreshuser", "password": "password123"},
    )
    
    # The client automatically handles cookies for subsequent requests
    refresh_response = await client.post("/api/auth/refresh")
    
    assert refresh_response.status_code == 200
    data = refresh_response.json()
    assert "access_token" in data
    
    # The new access token is returned successfully.
    # We do not assert it's different from the original because in fast tests
    # they might be generated in the exact same second, resulting in identical JWTs.


async def test_refresh_token_missing(client: AsyncClient):
    """Test refresh endpoint without cookie fails."""
    # No login performed, so no cookie
    response = await client.post("/api/auth/refresh")
    assert response.status_code == 401


async def test_logout(client: AsyncClient):
    """Test logout clears the refresh token cookie."""
    await client.post(
        "/api/auth/register",
        json={"username": "logoutuser", "password": "password123"},
    )
    
    await client.post(
        "/api/auth/login",
        data={"username": "logoutuser", "password": "password123"},
    )
    
    # Verify cookie exists
    assert "refresh_token" in client.cookies
    
    logout_response = await client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    
    # Verify cookie is cleared (httpx removes it or sets to empty/expired)
    assert "refresh_token" not in client.cookies or not client.cookies.get("refresh_token")
