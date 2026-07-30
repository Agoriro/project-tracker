"""SQLAlchemy ORM models — mapped to PostgreSQL tables."""

from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database import Base


# ---------------------------------------------------------------------------
# User (authentication)
# ---------------------------------------------------------------------------
class UserModel(Base):
    """Application user for JWT authentication."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------
class ProjectModel(Base):
    """A consulting/automation project in the portfolio."""

    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_code: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )

    # Classification
    engagement_type: Mapped[str] = mapped_column(String(50), nullable=False)
    client_alias: Mapped[str] = mapped_column(String(200), nullable=False)
    project_name: Mapped[str] = mapped_column(String(300), nullable=False)
    project_type_api: Mapped[str] = mapped_column(String(50), nullable=False)
    stage: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Activo")
    health: Mapped[str] = mapped_column(String(50), nullable=False)

    # Ownership
    owner_alias: Mapped[str] = mapped_column(String(200), nullable=False)
    owner_role: Mapped[str] = mapped_column(String(200), nullable=False, default="")

    # Dates
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Business value
    business_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD")

    # Task counters (denormalized)
    open_tasks: Mapped[int] = mapped_column(Integer, default=0)
    overdue_tasks: Mapped[int] = mapped_column(Integer, default=0)

    # Text fields
    blockers: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    recent_completed_examples: Mapped[str | None] = mapped_column(Text, nullable=True)

    # New fields (not in original dataset)
    next_step: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tasks: Mapped[list["TaskModel"]] = relationship(
        "TaskModel", back_populates="project", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# Task
# ---------------------------------------------------------------------------
class TaskModel(Base):
    """A task belonging to a project."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_code: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False, index=True
    )

    # Foreign key to project
    project_code: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("projects.project_code", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Assignment
    assignee_alias: Mapped[str] = mapped_column(String(200), nullable=False)
    assignee_role: Mapped[str] = mapped_column(String(200), nullable=False, default="")

    # Classification
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)

    # Dates
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_overdue: Mapped[bool] = mapped_column(Boolean, default=False)

    # Details
    dependency: Mapped[str | None] = mapped_column(Text, nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_progress: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Denormalized fields (from dataset, stored for convenience)
    engagement_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    client_alias: Mapped[str | None] = mapped_column(String(200), nullable=True)
    project_name: Mapped[str | None] = mapped_column(String(300), nullable=True)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    project: Mapped["ProjectModel"] = relationship(
        "ProjectModel", back_populates="tasks"
    )


# ---------------------------------------------------------------------------
# Team Member
# ---------------------------------------------------------------------------
class TeamMemberModel(Base):
    """A team member with workload metrics."""

    __tablename__ = "team_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    member_alias: Mapped[str] = mapped_column(
        String(200), unique=True, nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(200), nullable=False)

    # Portfolio metrics
    projects_in_portfolio: Mapped[int] = mapped_column(Integer, default=0)
    open_tasks_assigned: Mapped[int] = mapped_column(Integer, default=0)
    blocked_tasks_assigned: Mapped[int] = mapped_column(Integer, default=0)
    high_or_critical_open: Mapped[int] = mapped_column(Integer, default=0)

    # Project type breakdown
    diagnostico_projects: Mapped[int] = mapped_column(Integer, default=0)
    proyecto_projects: Mapped[int] = mapped_column(Integer, default=0)
    mantenimiento_projects: Mapped[int] = mapped_column(Integer, default=0)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
