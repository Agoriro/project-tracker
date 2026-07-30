"""Task DTOs — Pydantic v2 schemas for task endpoints."""

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

from app.domain.enums import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    """Shared properties between Create/Update and Read."""
    
    task_code: str = Field(..., max_length=30, examples=["TSK-001"])
    assignee_alias: str = Field(..., max_length=200, examples=["johndoe"])
    assignee_role: str = Field("", max_length=200)
    priority: TaskPriority
    status: TaskStatus
    due_date: Optional[date] = None
    dependency: Optional[str] = None
    title: str = Field(..., max_length=500, examples=["Set up database schemas"])
    detail: Optional[str] = None
    last_progress: Optional[str] = None


class TaskCreate(TaskBase):
    """Payload to create a new task within a project."""
    pass


class TaskUpdate(BaseModel):
    """Payload to update an existing task (partial update)."""
    
    assignee_alias: Optional[str] = Field(None, max_length=200)
    assignee_role: Optional[str] = Field(None, max_length=200)
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[date] = None
    dependency: Optional[str] = None
    title: Optional[str] = Field(None, max_length=500)
    detail: Optional[str] = None
    last_progress: Optional[str] = None


class TaskResponse(TaskBase):
    """Public task information returned to the client."""
    
    project_code: str
    is_overdue: bool
    
    # Denormalized project details for convenience in task-only views
    engagement_type: Optional[str] = None
    client_alias: Optional[str] = None
    project_name: Optional[str] = None

    model_config = {"from_attributes": True}
