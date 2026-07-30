"""Domain entities — pure dataclasses with no infrastructure dependencies."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime

from app.domain.enums import (
    Currency,
    EngagementType,
    Health,
    ProjectTypeAPI,
    Stage,
    TaskPriority,
    TaskStatus,
)


@dataclass
class Project:
    """A consulting/automation project in the portfolio."""

    project_code: str
    engagement_type: EngagementType
    client_alias: str
    project_name: str
    project_type_api: ProjectTypeAPI
    stage: Stage
    status: str
    health: Health
    owner_alias: str
    owner_role: str

    # Dates
    start_date: date | None = None
    target_date: date | None = None

    # Business
    business_value: float | None = None
    currency: Currency = Currency.USD

    # Task counters (denormalized for quick access)
    open_tasks: int = 0
    overdue_tasks: int = 0
    
    # Risk Engine metrics
    risk_score: int = 0
    risk_level: str = "Low"

    # Text fields
    blockers: str | None = None
    summary: str | None = None
    recent_completed_examples: str | None = None

    # New fields (not in dataset, added by system)
    next_step: str | None = None
    notes: str | None = None

    # Metadata
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass
class Task:
    """A task belonging to a project."""

    task_code: str
    project_code: str
    assignee_alias: str
    assignee_role: str
    priority: TaskPriority
    status: TaskStatus
    title: str

    # Dates
    due_date: date | None = None
    is_overdue: bool = False

    # Details
    dependency: str | None = None
    detail: str | None = None
    last_progress: str | None = None

    # Denormalized (from dataset, for convenience)
    engagement_type: EngagementType | None = None
    client_alias: str | None = None
    project_name: str | None = None

    # Metadata
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass
class TeamMember:
    """A team member with workload metrics."""

    member_alias: str
    role: str

    # Portfolio metrics
    projects_in_portfolio: int = 0
    open_tasks_assigned: int = 0
    blocked_tasks_assigned: int = 0
    high_or_critical_open: int = 0

    # Project type breakdown
    diagnostico_projects: int = 0
    proyecto_projects: int = 0
    mantenimiento_projects: int = 0

    # Metadata
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


@dataclass
class User:
    """Application user for authentication."""

    username: str
    hashed_password: str
    full_name: str = ""
    is_active: bool = True

    # Metadata
    id: int | None = None
    created_at: datetime | None = None
