"""Tests for project endpoints."""

import pytest
import pytest_asyncio
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Helper fixture to create a user and return auth headers."""
    await client.post(
        "/api/auth/register",
        json={"username": "projectuser", "password": "password123"},
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "projectuser", "password": "password123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def test_create_project(client: AsyncClient, auth_headers: dict[str, str]):
    """Test creating a new project."""
    payload = {
        "project_code": "PRJ-001",
        "engagement_type": "Proyecto",
        "client_alias": "Client A",
        "project_name": "Test Project",
        "project_type_api": "Consultoria",
        "stage": "Descubrimiento",
        "health": "Sano",
        "owner_alias": "johndoe",
        "owner_role": "Lead",
        "currency": "USD"
    }
    
    response = await client.post("/api/projects", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["project_code"] == "PRJ-001"
    assert data["open_tasks"] == 0
    assert data["overdue_tasks"] == 0


async def test_create_duplicate_project(client: AsyncClient, auth_headers: dict[str, str]):
    """Test creating a project with an existing code fails."""
    payload = {
        "project_code": "PRJ-002",
        "engagement_type": "Mantenimiento o recurrente",
        "client_alias": "Client B",
        "project_name": "Test Project 2",
        "project_type_api": "Automatizacion",
        "stage": "Ejecucion",
        "health": "En riesgo",
        "owner_alias": "johndoe",
        "owner_role": "Lead"
    }
    
    # Create first
    await client.post("/api/projects", json=payload, headers=auth_headers)
    
    # Try again
    response = await client.post("/api/projects", json=payload, headers=auth_headers)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


async def test_get_projects_unauthorized(client: AsyncClient):
    """Test accessing projects without token fails."""
    response = await client.get("/api/projects")
    assert response.status_code == 401


async def test_get_project_by_code(client: AsyncClient, auth_headers: dict[str, str]):
    """Test retrieving a specific project."""
    payload = {
        "project_code": "PRJ-003",
        "engagement_type": "Diagnostico",
        "client_alias": "Client C",
        "project_name": "Test Project 3",
        "project_type_api": "Consultoria",
        "stage": "Descubrimiento",
        "health": "Bloqueado",
        "owner_alias": "janedoe",
        "owner_role": "PM"
    }
    
    await client.post("/api/projects", json=payload, headers=auth_headers)
    
    response = await client.get("/api/projects/PRJ-003", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["project_name"] == "Test Project 3"


async def test_update_project(client: AsyncClient, auth_headers: dict[str, str]):
    """Test updating a project."""
    payload = {
        "project_code": "PRJ-004",
        "engagement_type": "Proyecto",
        "client_alias": "Client D",
        "project_name": "Test Project 4",
        "project_type_api": "Automatizacion",
        "stage": "Descubrimiento",
        "health": "Sano",
        "owner_alias": "bob",
        "owner_role": "Dev"
    }
    
    await client.post("/api/projects", json=payload, headers=auth_headers)
    
    # Update stage and health
    update_payload = {
        "stage": "Ejecucion",
        "health": "Sano",
        "notes": "Finished successfully"
    }
    
    response = await client.patch(
        "/api/projects/PRJ-004", 
        json=update_payload, 
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["stage"] == "Ejecucion"
    assert data["health"] == "Sano"
    assert data["notes"] == "Finished successfully"
    # Ensure un-updated fields remain
    assert data["project_name"] == "Test Project 4"
