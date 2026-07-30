"""Team application service — handles team business logic."""

from typing import Sequence

from app.api.dtos.team_dtos import TeamMemberCreate
from app.domain.entities import TeamMember
from app.infrastructure.repositories.team_repository import TeamRepository


class TeamError(Exception):
    """Domain-level error for team operations."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.status_code = status_code


class TeamService:
    """Orchestrates team use cases."""

    def __init__(self, team_repo: TeamRepository) -> None:
        self._repo = team_repo

    async def get_team_members(self, skip: int = 0, limit: int = 100) -> Sequence[TeamMember]:
        """Retrieve a paginated list of team members."""
        return await self._repo.get_all(skip=skip, limit=limit)

    async def get_team_member(self, member_alias: str) -> TeamMember:
        """Retrieve a single team member by alias. Raises 404 if not found."""
        member = await self._repo.get_by_alias(member_alias)
        if not member:
            raise TeamError(f"Team member '{member_alias}' not found.", status_code=404)
        return member

    async def create_team_member(self, data: TeamMemberCreate) -> TeamMember:
        """Create a new team member. Raises 409 if alias exists."""
        existing = await self._repo.get_by_alias(data.member_alias)
        if existing:
            raise TeamError(
                f"Team member '{data.member_alias}' already exists.", status_code=409
            )

        member = TeamMember(
            member_alias=data.member_alias,
            role=data.role,
        )
        return await self._repo.create(member)
