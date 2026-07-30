"""Auth router — endpoints for login, register, refresh, and logout."""

from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.dependencies import get_auth_service
from app.api.dtos.auth_dtos import RegisterRequest, TokenResponse, UserResponse
from app.application.auth_service import AuthError, AuthService
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_TOKEN_COOKIE = "refresh_token"


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    data: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    """Register a new user in the system."""
    try:
        user = await auth_service.register(
            username=data.username,
            password=data.password,
            full_name=data.full_name,
        )
        return user
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login to get access and refresh tokens",
)
async def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
):
    """Authenticate and return an access token.

    The refresh token is set as an HttpOnly cookie.
    """
    try:
        access_token, refresh_token = await auth_service.login(
            username=form_data.username, password=form_data.password
        )
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))

    # Set refresh token in HttpOnly cookie
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite="lax",
        secure=False,  # False for local dev without HTTPS
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
async def refresh(
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    refresh_token: Annotated[str | None, Cookie()] = None,
):
    """Use the refresh token cookie to get a new access token."""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing in cookies",
        )

    try:
        access_token = await auth_service.refresh(refresh_token)
        return {"access_token": access_token, "token_type": "bearer"}
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post("/logout", summary="Logout user")
async def logout(response: Response):
    """Logout by clearing the refresh token cookie."""
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE,
        samesite="lax",
        httponly=True,
    )
    return {"message": "Successfully logged out"}
