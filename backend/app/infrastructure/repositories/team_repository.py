"""Team member repository — database access for TeamMember entities."""

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities import TeamMember
from app.infrastructure.models import TeamMemberModel, TaskModel, ProjectModel


class TeamRepository:
    """Async repository for TeamMember persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_alias(self, member_alias: str) -> TeamMember | None:
        """Get a team member by their unique alias."""
        result = await self._session.execute(
            select(TeamMemberModel).where(TeamMemberModel.member_alias == member_alias)
        )
        row = result.scalar_one_or_none()
        return _to_entity(row) if row else None

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[TeamMember]:
        """Get a paginated list of team members."""
        result = await self._session.execute(
            select(TeamMemberModel).order_by(TeamMemberModel.member_alias.asc()).offset(skip).limit(limit)
        )
        return [_to_entity(row) for row in result.scalars().all()]

    async def create(self, member: TeamMember) -> TeamMember:
        """Create a new team member."""
        model = TeamMemberModel(
            member_alias=member.member_alias,
            role=member.role,
            projects_in_portfolio=member.projects_in_portfolio,
            open_tasks_assigned=member.open_tasks_assigned,
            blocked_tasks_assigned=member.blocked_tasks_assigned,
            high_or_critical_open=member.high_or_critical_open,
            diagnostico_projects=member.diagnostico_projects,
            proyecto_projects=member.proyecto_projects,
            mantenimiento_projects=member.mantenimiento_projects,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return _to_entity(model)

    async def update(self, member: TeamMember) -> TeamMember:
        """Update an existing team member."""
        result = await self._session.execute(
            select(TeamMemberModel).where(TeamMemberModel.member_alias == member.member_alias)
        )
        model = result.scalar_one_or_none()
        
        if not model:
            raise ValueError(f"Team member {member.member_alias} not found")

        # Update metrics and fields
        model.role = member.role
        model.projects_in_portfolio = member.projects_in_portfolio
        model.open_tasks_assigned = member.open_tasks_assigned
        model.blocked_tasks_assigned = member.blocked_tasks_assigned
        model.high_or_critical_open = member.high_or_critical_open
        model.diagnostico_projects = member.diagnostico_projects
        model.proyecto_projects = member.proyecto_projects
        model.mantenimiento_projects = member.mantenimiento_projects

        await self._session.flush()
        await self._session.refresh(model)
        return _to_entity(model)


def _to_entity(model: TeamMemberModel) -> TeamMember:
    return TeamMember(
        member_alias=model.member_alias,
        role=model.role,
        projects_in_portfolio=model.projects_in_portfolio,
        open_tasks_assigned=model.open_tasks_assigned,
        blocked_tasks_assigned=model.blocked_tasks_assigned,
        high_or_critical_open=model.high_or_critical_open,
        diagnostico_projects=model.diagnostico_projects,
        proyecto_projects=model.proyecto_projects,
        mantenimiento_projects=model.mantenimiento_projects,
    )
