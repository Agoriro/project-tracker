"""Project application service — handles project business logic."""

from typing import Sequence

from app.api.dtos.project_dtos import ProjectCreate, ProjectUpdate
from app.domain.entities import Project
from app.infrastructure.repositories.project_repository import ProjectRepository


class ProjectError(Exception):
    """Domain-level error for project operations."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


class ProjectService:
    """Orchestrates project use cases."""

    def __init__(self, project_repo: ProjectRepository) -> None:
        self._repo = project_repo

    async def get_projects(self, skip: int = 0, limit: int = 100) -> Sequence[Project]:
        """Retrieve a paginated list of projects."""
        return await self._repo.get_all(skip=skip, limit=limit)

    async def get_project(self, project_code: str) -> Project:
        """Retrieve a single project by code. Raises 404 if not found."""
        project = await self._repo.get_by_code(project_code)
        if not project:
            raise ProjectError(f"Project '{project_code}' not found.", status_code=404)
        return project

    async def create_project(self, data: ProjectCreate) -> Project:
        """Create a new project. Raises 409 if project_code exists."""
        existing = await self._repo.get_by_code(data.project_code)
        if existing:
            raise ProjectError(
                f"Project '{data.project_code}' already exists.", status_code=409
            )

        project = Project(
            project_code=data.project_code,
            engagement_type=data.engagement_type,
            client_alias=data.client_alias,
            project_name=data.project_name,
            project_type_api=data.project_type_api,
            stage=data.stage,
            status=data.status,
            health=data.health,
            owner_alias=data.owner_alias,
            owner_role=data.owner_role,
            start_date=data.start_date,
            target_date=data.target_date,
            business_value=data.business_value,
            currency=data.currency,
            blockers=data.blockers,
            summary=data.summary,
            recent_completed_examples=data.recent_completed_examples,
            next_step=data.next_step,
            notes=data.notes,
        )
        return await self._repo.create(project)

    async def update_project(self, project_code: str, data: ProjectUpdate) -> Project:
        """Update an existing project partially. Raises 404 if not found."""
        project = await self._repo.get_by_code(project_code)
        if not project:
            raise ProjectError(f"Project '{project_code}' not found.", status_code=404)

        # Update fields that were provided in the DTO
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)

        return await self._repo.update(project)
