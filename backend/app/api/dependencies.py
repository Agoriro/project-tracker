"""FastAPI dependencies for the application."""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.auth_service import AuthError, AuthService
from app.application.project_service import ProjectService
from app.application.task_service import TaskService
from app.application.team_service import TeamService
from app.domain.entities import User
from app.infrastructure.database import get_db
from app.infrastructure.repositories.project_repository import ProjectRepository
from app.infrastructure.repositories.task_repository import TaskRepository
from app.infrastructure.repositories.team_repository import TeamRepository
from app.infrastructure.repositories.user_repository import UserRepository

# OAuth2 scheme for Swagger UI (expects token in Authorization header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> UserRepository:
    """Dependency for UserRepository."""
    return UserRepository(session)


def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repository)]
) -> AuthService:
    """Dependency for AuthService."""
    return AuthService(user_repo)


def get_project_repository(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> ProjectRepository:
    """Dependency for ProjectRepository."""
    return ProjectRepository(session)


def get_project_service(
    project_repo: Annotated[ProjectRepository, Depends(get_project_repository)]
) -> ProjectService:
    """Dependency for ProjectService."""
    return ProjectService(project_repo)


def get_task_repository(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> TaskRepository:
    """Dependency for TaskRepository."""
    return TaskRepository(session)


def get_task_service(
    task_repo: Annotated[TaskRepository, Depends(get_task_repository)],
    project_repo: Annotated[ProjectRepository, Depends(get_project_repository)],
) -> TaskService:
    """Dependency for TaskService."""
    return TaskService(task_repo, project_repo)


def get_team_repository(
    session: Annotated[AsyncSession, Depends(get_db)]
) -> TeamRepository:
    """Dependency for TeamRepository."""
    return TeamRepository(session)


def get_team_service(
    team_repo: Annotated[TeamRepository, Depends(get_team_repository)]
) -> TeamService:
    """Dependency for TeamService."""
    return TeamService(team_repo)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """Dependency to get the current authenticated user.

    Uses the access token from the Authorization bearer header.
    """
    try:
        return await auth_service.get_current_user(token)
    except AuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
