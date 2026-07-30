"""Tasks router — endpoints for managing tasks."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user, get_task_service
from app.api.dtos.task_dtos import TaskCreate, TaskResponse, TaskUpdate
from app.application.task_service import TaskError, TaskService

# Router specifically for /tasks endpoint (global operations, like update)
router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
    dependencies=[Depends(get_current_user)],
)

# Nested router to attach to /projects/{project_code}/tasks
projects_tasks_router = APIRouter(
    prefix="/projects/{project_code}/tasks",
    tags=["Tasks (Project scoped)"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "",
    response_model=list[TaskResponse],
    summary="List all tasks globally",
)
async def list_all_tasks(
    task_service: Annotated[TaskService, Depends(get_task_service)],
    skip: int = 0,
    limit: int = 500,
):
    """Retrieve all tasks across all projects."""
    try:
        return await task_service.get_all_tasks(skip, limit)
    except TaskError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.get(
    "/{task_code}",
    response_model=TaskResponse,
    summary="Get a single task by code",
)
async def get_task(
    task_code: str,
    task_service: Annotated[TaskService, Depends(get_task_service)],
):
    """Retrieve details for a single task by its task_code."""
    try:
        return await task_service.get_task_by_code(task_code)
    except TaskError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))

@projects_tasks_router.get(
    "",
    response_model=list[TaskResponse],
    summary="List all tasks for a project",
)
async def list_project_tasks(
    project_code: str,
    task_service: Annotated[TaskService, Depends(get_task_service)],
    skip: int = 0,
    limit: int = 100,
):
    """Retrieve all tasks that belong to the specified project."""
    try:
        return await task_service.get_tasks_by_project(project_code, skip, limit)
    except TaskError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@projects_tasks_router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task in a project",
)
async def create_task(
    project_code: str,
    data: TaskCreate,
    task_service: Annotated[TaskService, Depends(get_task_service)],
):
    """Create a new task for the given project. 
    This automatically triggers project metric recalculation."""
    try:
        return await task_service.create_task(project_code, data)
    except TaskError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.patch(
    "/{task_code}",
    response_model=TaskResponse,
    summary="Update an existing task",
)
async def update_task(
    task_code: str,
    data: TaskUpdate,
    task_service: Annotated[TaskService, Depends(get_task_service)],
):
    """Update fields of an existing task globally (by task_code).
    This automatically triggers project metric recalculation if status changes."""
    try:
        return await task_service.update_task(task_code, data)
    except TaskError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
