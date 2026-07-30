"""Tests for team member endpoints."""

import pytest
import pytest_asyncio
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Helper fixture to create a user and return auth headers."""
    await client.post(
        "/api/auth/register",
        json={"username": "teamuser", "password": "password123"},
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "teamuser", "password": "password123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def test_create_team_member(client: AsyncClient, auth_headers: dict[str, str]):
    """Test creating a team member initializes metrics at 0."""
    payload = {
        "member_alias": "alice",
        "role": "Frontend Developer"
    }
    response = await client.post("/api/team", json=payload, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["member_alias"] == "alice"
    assert data["projects_in_portfolio"] == 0
    assert data["open_tasks_assigned"] == 0
    assert data["high_or_critical_open"] == 0


async def test_get_team_member(client: AsyncClient, auth_headers: dict[str, str]):
    """Test fetching a specific team member."""
    await client.post("/api/team", json={"member_alias": "bob", "role": "Backend"}, headers=auth_headers)
    
    response = await client.get("/api/team/bob", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["role"] == "Backend"
