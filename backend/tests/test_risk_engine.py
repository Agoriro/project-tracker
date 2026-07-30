"""Tests for risk engine and portfolio evaluation."""

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
        json={"username": "riskuser", "password": "password123"},
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "riskuser", "password": "password123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def setup_portfolio(client: AsyncClient, auth_headers: dict[str, str]) -> str:
    """Setup a project with overdue tasks and a team member."""
    # 1. Create a project
    proj_payload = {
        "project_code": "PRJ-RISK-1",
        "engagement_type": "Proyecto",
        "client_alias": "Client R",
        "project_name": "Risk Project",
        "project_type_api": "Automatizacion",
        "stage": "Ejecucion",
        "health": "Sano",
        "owner_alias": "owner",
        "owner_role": "PM"
    }
    await client.post("/api/projects", json=proj_payload, headers=auth_headers)
    
    # 2. Create a team member
    await client.post("/api/team", json={"member_alias": "dev_risk", "role": "Dev"}, headers=auth_headers)
    
    # 3. Create 3 overdue high-priority tasks
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    for i in range(1, 4):
        await client.post(
            "/api/projects/PRJ-RISK-1/tasks",
            json={
                "task_code": f"TSK-R-{i}",
                "assignee_alias": "dev_risk",
                "priority": "Alta",
                "status": "En progreso",
                "title": f"Risk Task {i}",
                "due_date": yesterday
            },
            headers=auth_headers
        )
    return "PRJ-RISK-1"


async def test_risk_engine_evaluation(client: AsyncClient, auth_headers: dict[str, str], setup_portfolio: str):
    """Test that the risk engine recalculates team metrics and flags projects at risk."""
    project_code = setup_portfolio
    
    # 1. Verify project is currently Sano (even though it has 3 overdue tasks, risk engine hasn't run)
    # The risk engine is a cron/background job, so we need to manually trigger it
    proj_resp = await client.get(f"/api/projects/{project_code}", headers=auth_headers)
    assert proj_resp.json()["health"] == "Sano"
    assert proj_resp.json()["overdue_tasks"] == 3
    
    # 2. Trigger risk engine
    eval_resp = await client.post("/api/risk/evaluate", headers=auth_headers)
    assert eval_resp.status_code == 200
    data = eval_resp.json()["data"]
    
    # One project flagged, one team member updated
    assert data["projects_flagged_at_risk"] == 1
    assert data["team_members_updated"] > 0
    
    # 3. Verify project health changed to En riesgo
    proj_resp = await client.get(f"/api/projects/{project_code}", headers=auth_headers)
    assert proj_resp.json()["health"] == "En riesgo"
    
    # 4. Verify team member workload metrics were updated
    team_resp = await client.get("/api/team/dev_risk", headers=auth_headers)
    member_data = team_resp.json()
    
    assert member_data["open_tasks_assigned"] == 3
    assert member_data["high_or_critical_open"] == 3
    assert member_data["projects_in_portfolio"] == 1
    assert member_data["proyecto_projects"] == 1
    assert member_data["diagnostico_projects"] == 0
