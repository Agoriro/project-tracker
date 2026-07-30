"""Project DTOs — Pydantic v2 schemas for project endpoints."""

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.domain.enums import Currency, EngagementType, Health, ProjectTypeAPI, Stage


class ProjectBase(BaseModel):
    """Shared properties between Create/Update and Read."""
    
    project_code: str = Field(..., max_length=20, examples=["PRJ-001"])
    engagement_type: EngagementType
    client_alias: str = Field(..., max_length=200, examples=["Client A"])
    project_name: str = Field(..., max_length=300, examples=["Cloud Migration"])
    project_type_api: ProjectTypeAPI
    stage: Stage
    status: str = Field("Activo", max_length=50)
    health: Health
    
    owner_alias: str = Field(..., max_length=200, examples=["johndoe"])
    owner_role: str = Field(..., max_length=200, examples=["Lead Engineer"])
    
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    
    business_value: Optional[float] = None
    currency: Currency = Currency.USD
    
    blockers: Optional[str] = None
    summary: Optional[str] = None
    recent_completed_examples: Optional[str] = None
    next_step: Optional[str] = None
    notes: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Payload to create a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Payload to update an existing project (partial update)."""
    
    engagement_type: Optional[EngagementType] = None
    client_alias: Optional[str] = Field(None, max_length=200)
    project_name: Optional[str] = Field(None, max_length=300)
    project_type_api: Optional[ProjectTypeAPI] = None
    stage: Optional[Stage] = None
    status: Optional[str] = Field(None, max_length=50)
    health: Optional[Health] = None
    
    owner_alias: Optional[str] = Field(None, max_length=200)
    owner_role: Optional[str] = Field(None, max_length=200)
    
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    
    business_value: Optional[float] = None
    currency: Optional[Currency] = None
    
    blockers: Optional[str] = None
    summary: Optional[str] = None
    recent_completed_examples: Optional[str] = None
    next_step: Optional[str] = None
    notes: Optional[str] = None


class ProjectResponse(ProjectBase):
    """Public project information returned to the client."""
    
    open_tasks: int
    overdue_tasks: int
    risk_score: int
    risk_level: str

    model_config = {"from_attributes": True}
