"""Team DTOs — Pydantic v2 schemas for team endpoints."""

from typing import Optional
from pydantic import BaseModel, Field


class TeamMemberBase(BaseModel):
    """Shared properties for TeamMember."""
    member_alias: str = Field(..., max_length=200, examples=["johndoe"])
    role: str = Field(..., max_length=200, examples=["Lead Engineer"])


class TeamMemberCreate(TeamMemberBase):
    """Payload to create a new team member."""
    pass


class TeamMemberUpdate(BaseModel):
    """Payload to update an existing team member."""
    role: Optional[str] = Field(None, max_length=200)


class TeamMemberResponse(TeamMemberBase):
    """Public team member info returned to the client, including metrics."""
    
    projects_in_portfolio: int
    open_tasks_assigned: int
    blocked_tasks_assigned: int
    high_or_critical_open: int
    diagnostico_projects: int
    proyecto_projects: int
    mantenimiento_projects: int

    model_config = {"from_attributes": True}
