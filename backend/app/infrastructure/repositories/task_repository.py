"""Task repository — database access for Task entities."""

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities import Task
from app.infrastructure.models import TaskModel


class TaskRepository:
    """Async repository for Task persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_code(self, task_code: str) -> Task | None:
        """Get a task by its unique task_code."""
        result = await self._session.execute(
            select(TaskModel).where(TaskModel.task_code == task_code)
        )
        row = result.scalar_one_or_none()
        return _to_entity(row) if row else None

    async def get_all(self, skip: int = 0, limit: int = 500) -> Sequence[Task]:
        """Get all tasks across all projects."""
        result = await self._session.execute(
            select(TaskModel)
            .order_by(TaskModel.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return [_to_entity(row) for row in result.scalars().all()]

    async def get_by_project(
        self, project_code: str, skip: int = 0, limit: int = 100
    ) -> Sequence[Task]:
        """Get all tasks for a specific project."""
        result = await self._session.execute(
            select(TaskModel)
            .where(TaskModel.project_code == project_code)
            .order_by(TaskModel.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return [_to_entity(row) for row in result.scalars().all()]

    async def create(self, task: Task) -> Task:
        """Create a new task."""
        model = TaskModel(
            task_code=task.task_code,
            project_code=task.project_code,
            assignee_alias=task.assignee_alias,
            assignee_role=task.assignee_role,
            priority=task.priority,
            status=task.status,
            due_date=task.due_date,
            is_overdue=task.is_overdue,
            dependency=task.dependency,
            title=task.title,
            detail=task.detail,
            last_progress=task.last_progress,
            engagement_type=task.engagement_type,
            client_alias=task.client_alias,
            project_name=task.project_name,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return _to_entity(model)

    async def update(self, task: Task) -> Task:
        """Update an existing task."""
        result = await self._session.execute(
            select(TaskModel).where(TaskModel.task_code == task.task_code)
        )
        model = result.scalar_one_or_none()
        
        if not model:
            raise ValueError(f"Task {task.task_code} not found")

        # Update fields
        model.assignee_alias = task.assignee_alias
        model.assignee_role = task.assignee_role
        model.priority = task.priority
        model.status = task.status
        model.due_date = task.due_date
        model.is_overdue = task.is_overdue
        model.dependency = task.dependency
        model.title = task.title
        model.detail = task.detail
        model.last_progress = task.last_progress
        
        await self._session.flush()
        await self._session.refresh(model)
        return _to_entity(model)


def _to_entity(model: TaskModel) -> Task:
    return Task(
        task_code=model.task_code,
        project_code=model.project_code,
        assignee_alias=model.assignee_alias,
        assignee_role=model.assignee_role,
        priority=model.priority,
        status=model.status,
        due_date=model.due_date,
        is_overdue=model.is_overdue,
        dependency=model.dependency,
        title=model.title,
        detail=model.detail,
        last_progress=model.last_progress,
        engagement_type=model.engagement_type,
        client_alias=model.client_alias,
        project_name=model.project_name,
    )
