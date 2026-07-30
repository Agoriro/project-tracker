"""Projects router — endpoints for managing projects."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_project_service
from app.api.dtos.project_dtos import ProjectCreate, ProjectResponse, ProjectUpdate
from app.application.project_service import ProjectError, ProjectService
from app.domain.entities import User

# All endpoints in this router require an authenticated user
router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "",
    response_model=list[ProjectResponse],
    summary="List projects",
)
async def list_projects(
    project_service: Annotated[ProjectService, Depends(get_project_service)],
    skip: int = 0,
    limit: int = 100,
):
    """Get a paginated list of all projects."""
    return await project_service.get_projects(skip=skip, limit=limit)


@router.get(
    "/{project_code}",
    response_model=ProjectResponse,
    summary="Get a project by code",
)
async def get_project(
    project_code: str,
    project_service: Annotated[ProjectService, Depends(get_project_service)],
):
    """Retrieve details of a specific project by its project_code."""
    try:
        return await project_service.get_project(project_code)
    except ProjectError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
)
async def create_project(
    data: ProjectCreate,
    project_service: Annotated[ProjectService, Depends(get_project_service)],
):
    """Create a new project in the portfolio."""
    try:
        return await project_service.create_project(data)
    except ProjectError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.patch(
    "/{project_code}",
    response_model=ProjectResponse,
    summary="Update an existing project",
)
async def update_project(
    project_code: str,
    data: ProjectUpdate,
    project_service: Annotated[ProjectService, Depends(get_project_service)],
):
    """Update fields of an existing project."""
    try:
        return await project_service.update_project(project_code, data)
    except ProjectError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
