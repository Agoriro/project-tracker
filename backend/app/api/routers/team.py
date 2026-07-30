"""Team router — endpoints for managing team members."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_team_service
from app.api.dtos.team_dtos import TeamMemberCreate, TeamMemberResponse
from app.application.team_service import TeamError, TeamService

# All endpoints in this router require an authenticated user
router = APIRouter(
    prefix="/team",
    tags=["Team"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "",
    response_model=list[TeamMemberResponse],
    summary="List team members",
)
async def list_team_members(
    team_service: Annotated[TeamService, Depends(get_team_service)],
    skip: int = 0,
    limit: int = 100,
):
    """Get a paginated list of all team members."""
    return await team_service.get_team_members(skip=skip, limit=limit)


@router.get(
    "/{member_alias}",
    response_model=TeamMemberResponse,
    summary="Get a team member by alias",
)
async def get_team_member(
    member_alias: str,
    team_service: Annotated[TeamService, Depends(get_team_service)],
):
    """Retrieve details of a specific team member by their alias."""
    try:
        return await team_service.get_team_member(member_alias)
    except TeamError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post(
    "",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new team member",
)
async def create_team_member(
    data: TeamMemberCreate,
    team_service: Annotated[TeamService, Depends(get_team_service)],
):
    """Create a new team member."""
    try:
        return await team_service.create_team_member(data)
    except TeamError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
