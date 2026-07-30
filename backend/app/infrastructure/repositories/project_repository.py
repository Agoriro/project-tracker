"""Project repository — database access for Project entities."""

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities import Project
from app.infrastructure.models import ProjectModel, TaskModel


class ProjectRepository:
    """Async repository for Project persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_code(self, project_code: str) -> Project | None:
        """Get a project by its unique project_code."""
        result = await self._session.execute(
            select(ProjectModel).where(ProjectModel.project_code == project_code)
        )
        row = result.scalar_one_or_none()
        return _to_entity(row) if row else None

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[Project]:
        """Get a paginated list of projects."""
        result = await self._session.execute(
            select(ProjectModel).order_by(ProjectModel.created_at.desc()).offset(skip).limit(limit)
        )
        return [_to_entity(row) for row in result.scalars().all()]

    async def create(self, project: Project) -> Project:
        """Create a new project."""
        model = ProjectModel(
            project_code=project.project_code,
            engagement_type=project.engagement_type,
            client_alias=project.client_alias,
            project_name=project.project_name,
            project_type_api=project.project_type_api,
            stage=project.stage,
            status=project.status,
            health=project.health,
            owner_alias=project.owner_alias,
            owner_role=project.owner_role,
            start_date=project.start_date,
            target_date=project.target_date,
            business_value=project.business_value,
            currency=project.currency,
            open_tasks=project.open_tasks,
            overdue_tasks=project.overdue_tasks,
            blockers=project.blockers,
            summary=project.summary,
            recent_completed_examples=project.recent_completed_examples,
            next_step=project.next_step,
            notes=project.notes,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return _to_entity(model)

    async def update(self, project: Project) -> Project:
        """Update an existing project."""
        result = await self._session.execute(
            select(ProjectModel).where(ProjectModel.project_code == project.project_code)
        )
        model = result.scalar_one_or_none()
        
        if not model:
            raise ValueError(f"Project {project.project_code} not found")

        # Update fields
        model.engagement_type = project.engagement_type
        model.client_alias = project.client_alias
        model.project_name = project.project_name
        model.project_type_api = project.project_type_api
        model.stage = project.stage
        model.status = project.status
        model.health = project.health
        model.owner_alias = project.owner_alias
        model.owner_role = project.owner_role
        model.start_date = project.start_date
        model.target_date = project.target_date
        model.business_value = project.business_value
        model.currency = project.currency
        model.open_tasks = project.open_tasks
        model.overdue_tasks = project.overdue_tasks
        model.blockers = project.blockers
        model.summary = project.summary
        model.recent_completed_examples = project.recent_completed_examples
        model.next_step = project.next_step
        model.notes = project.notes

        await self._session.flush()
        await self._session.refresh(model)
        return _to_entity(model)
        
    async def recalculate_task_metrics(self, project_code: str) -> None:
        """Recalculate denormalized task metrics for a project."""
        from sqlalchemy import func
        
        # Count open tasks
        open_result = await self._session.execute(
            select(func.count(TaskModel.id))
            .where(TaskModel.project_code == project_code)
            .where(TaskModel.status != "Completada")
        )
        open_count = open_result.scalar() or 0
        
        # Count overdue tasks
        overdue_result = await self._session.execute(
            select(func.count(TaskModel.id))
            .where(TaskModel.project_code == project_code)
            .where(TaskModel.is_overdue == True)
        )
        overdue_count = overdue_result.scalar() or 0
        
        # Update project
        result = await self._session.execute(
            select(ProjectModel).where(ProjectModel.project_code == project_code)
        )
        model = result.scalar_one_or_none()
        if model:
            model.open_tasks = open_count
            model.overdue_tasks = overdue_count
            await self._session.flush()


def _to_entity(model: ProjectModel) -> Project:
    return Project(
        project_code=model.project_code,
        engagement_type=model.engagement_type,
        client_alias=model.client_alias,
        project_name=model.project_name,
        project_type_api=model.project_type_api,
        stage=model.stage,
        status=model.status,
        health=model.health,
        owner_alias=model.owner_alias,
        owner_role=model.owner_role,
        start_date=model.start_date,
        target_date=model.target_date,
        business_value=model.business_value,
        currency=model.currency,
        open_tasks=model.open_tasks,
        overdue_tasks=model.overdue_tasks,
        blockers=model.blockers,
        summary=model.summary,
        recent_completed_examples=model.recent_completed_examples,
        next_step=model.next_step,
        notes=model.notes,
    )
