"""Tests for task endpoints and project metric recalculation."""

from datetime import date, timedelta

import pytest
import pytest_asyncio
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Helper fixture to create a user and return auth headers."""
    await client.post(
        "/api/auth/register",
        json={"username": "taskuser", "password": "password123"},
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "taskuser", "password": "password123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def project_code(client: AsyncClient, auth_headers: dict[str, str]) -> str:
    """Helper fixture to create a project and return its code."""
    payload = {
        "project_code": "PRJ-TSK-1",
        "engagement_type": "Proyecto",
        "client_alias": "Client T",
        "project_name": "Task Test Project",
        "project_type_api": "Automatizacion",
        "stage": "Ejecucion",
        "health": "Sano",
        "owner_alias": "owner",
        "owner_role": "PM"
    }
    await client.post("/api/projects", json=payload, headers=auth_headers)
    return "PRJ-TSK-1"


async def test_create_task(client: AsyncClient, auth_headers: dict[str, str], project_code: str):
    """Test creating a task updates the project's open_tasks counter."""
    
    # 1. Verify project starts with 0 open tasks
    proj_resp = await client.get(f"/api/projects/{project_code}", headers=auth_headers)
    assert proj_resp.json()["open_tasks"] == 0
    
    # 2. Create an open task
    task_payload = {
        "task_code": "TSK-001",
        "assignee_alias": "dev1",
        "priority": "Alta",
        "status": "Por hacer",
        "title": "Initial setup"
    }
    
    response = await client.post(
        f"/api/projects/{project_code}/tasks", 
        json=task_payload, 
        headers=auth_headers
    )
    
    assert response.status_code == 201
    assert response.json()["task_code"] == "TSK-001"
    
    # 3. Verify project open_tasks is now 1
    proj_resp2 = await client.get(f"/api/projects/{project_code}", headers=auth_headers)
    assert proj_resp2.json()["open_tasks"] == 1


async def test_create_overdue_task(client: AsyncClient, auth_headers: dict[str, str], project_code: str):
    """Test creating an overdue task updates overdue_tasks counter."""
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    
    task_payload = {
        "task_code": "TSK-002",
        "assignee_alias": "dev2",
        "priority": "Critica",
        "status": "En progreso",
        "title": "Late task",
        "due_date": yesterday
    }
    
    response = await client.post(
        f"/api/projects/{project_code}/tasks", 
        json=task_payload, 
        headers=auth_headers
    )
    
    assert response.status_code == 201
    assert response.json()["is_overdue"] is True
    
    # Verify project overdue_tasks increased
    proj_resp = await client.get(f"/api/projects/{project_code}", headers=auth_headers)
    assert proj_resp.json()["overdue_tasks"] == 1


async def test_update_task_status_updates_metrics(client: AsyncClient, auth_headers: dict[str, str], project_code: str):
    """Test that closing a task reduces the open_tasks count."""
    
    # 1. Create task
    task_payload = {
        "task_code": "TSK-003",
        "assignee_alias": "dev3",
        "priority": "Media",
        "status": "Por hacer",
        "title": "Will be closed"
    }
    await client.post(
        f"/api/projects/{project_code}/tasks", 
        json=task_payload, 
        headers=auth_headers
    )
    
    # Save open count
    proj_before = await client.get(f"/api/projects/{project_code}", headers=auth_headers)
    open_before = proj_before.json()["open_tasks"]
    
    # 2. Update task to Completada
    update_payload = {
        "status": "Completada"
    }
    patch_resp = await client.patch(
        "/api/tasks/TSK-003", 
        json=update_payload, 
        headers=auth_headers
    )
    
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "Completada"
    
    # 3. Verify open_tasks decreased by 1
    proj_after = await client.get(f"/api/projects/{project_code}", headers=auth_headers)
    open_after = proj_after.json()["open_tasks"]
    assert open_after == open_before - 1
