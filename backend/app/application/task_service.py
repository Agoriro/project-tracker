"""Task application service — handles task business logic and triggers project metric recalculation."""

from datetime import date
from typing import Sequence

from app.api.dtos.task_dtos import TaskCreate, TaskUpdate
from app.domain.entities import Task
from app.infrastructure.repositories.project_repository import ProjectRepository
from app.infrastructure.repositories.task_repository import TaskRepository


class TaskError(Exception):
    """Domain-level error for task operations."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


class TaskService:
    """Orchestrates task use cases."""

    def __init__(
        self, task_repo: TaskRepository, project_repo: ProjectRepository
    ) -> None:
        self._task_repo = task_repo
        self._project_repo = project_repo

    async def get_all_tasks(self, skip: int = 0, limit: int = 500) -> Sequence[Task]:
        """Retrieve all tasks globally."""
        return await self._task_repo.get_all(skip=skip, limit=limit)

    async def get_tasks_by_project(
        self, project_code: str, skip: int = 0, limit: int = 100
    ) -> Sequence[Task]:
        """Retrieve tasks belonging to a specific project."""
        # Ensure project exists
        project = await self._project_repo.get_by_code(project_code)
        if not project:
            raise TaskError(f"Project '{project_code}' not found.", status_code=404)
            
        return await self._task_repo.get_by_project(
            project_code, skip=skip, limit=limit
        )

    async def create_task(self, project_code: str, data: TaskCreate) -> Task:
        """Create a new task under a project and recalculate project metrics."""
        # Ensure project exists and get its denormalized fields
        project = await self._project_repo.get_by_code(project_code)
        if not project:
            raise TaskError(f"Project '{project_code}' not found.", status_code=404)
            
        # Check if task code already exists globally
        existing = await self._task_repo.get_by_code(data.task_code)
        if existing:
            raise TaskError(
                f"Task '{data.task_code}' already exists.", status_code=409
            )

        is_overdue = data.due_date is not None and data.due_date < date.today()

        task = Task(
            task_code=data.task_code,
            project_code=project_code,
            assignee_alias=data.assignee_alias,
            assignee_role=data.assignee_role,
            priority=data.priority,
            status=data.status,
            due_date=data.due_date,
            is_overdue=is_overdue,
            dependency=data.dependency,
            title=data.title,
            detail=data.detail,
            last_progress=data.last_progress,
            
            # Copy denormalized fields from project
            engagement_type=project.engagement_type,
            client_alias=project.client_alias,
            project_name=project.project_name,
        )
        
        created_task = await self._task_repo.create(task)
        
        # Trigger recalculation of project counters
        await self._project_repo.recalculate_task_metrics(project_code)
        
        return created_task

    async def update_task(self, task_code: str, data: TaskUpdate) -> Task:
        """Update an existing task and recalculate project metrics if status changes."""
        task = await self._task_repo.get_by_code(task_code)
        if not task:
            raise TaskError(f"Task '{task_code}' not found.", status_code=404)

        status_changed = data.status is not None and data.status != task.status

        # Update fields
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)
            
        if "due_date" in update_data:
            task.is_overdue = task.due_date is not None and task.due_date < date.today()

        updated_task = await self._task_repo.update(task)
        
        # Recalculate project metrics if the status changed (open/closed)
        if status_changed or "due_date" in update_data:
            await self._project_repo.recalculate_task_metrics(task.project_code)

        return updated_task
