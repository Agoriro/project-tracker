"""Auth application service — orchestrates login, register, and token refresh."""

from app.domain.entities import User
from app.infrastructure.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.infrastructure.repositories.user_repository import UserRepository


class AuthError(Exception):
    """Domain-level auth error (bad credentials, duplicate user, etc.)."""

    def __init__(self, message: str, status_code: int = 401) -> None:
        super().__init__(message)
        self.status_code = status_code


class AuthService:
    """Orchestrates authentication use cases."""

    def __init__(self, user_repo: UserRepository) -> None:
        self._repo = user_repo

    async def register(
        self, username: str, password: str, full_name: str = ""
    ) -> User:
        """Create a new user. Raises AuthError if username is taken."""
        if await self._repo.exists(username):
            raise AuthError(
                f"Username '{username}' is already taken.", status_code=409
            )
        user = User(
            username=username,
            hashed_password=hash_password(password),
            full_name=full_name,
        )
        return await self._repo.create(user)

    async def login(self, username: str, password: str) -> tuple[str, str]:
        """Validate credentials and return (access_token, refresh_token).

        Raises AuthError on invalid credentials or inactive account.
        """
        user = await self._repo.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise AuthError("Invalid username or password.")
        if not user.is_active:
            raise AuthError("Account is inactive.", status_code=403)
        return create_access_token(username), create_refresh_token(username)

    async def refresh(self, refresh_token: str) -> str:
        """Validate a refresh token and return a new access token.

        Raises AuthError if the token is invalid or expired.
        """
        import jwt as pyjwt

        try:
            payload = decode_token(refresh_token)
        except pyjwt.ExpiredSignatureError:
            raise AuthError("Refresh token has expired.")
        except pyjwt.PyJWTError:
            raise AuthError("Invalid refresh token.")

        if payload.get("type") != "refresh":
            raise AuthError("Not a refresh token.")

        username: str = payload.get("sub", "")
        user = await self._repo.get_by_username(username)
        if not user or not user.is_active:
            raise AuthError("User not found or inactive.")

        return create_access_token(username)

    async def get_current_user(self, access_token: str) -> User:
        """Validate an access token and return the associated User.

        Raises AuthError if token is invalid, expired, or user not found.
        """
        import jwt as pyjwt

        try:
            payload = decode_token(access_token)
        except pyjwt.ExpiredSignatureError:
            raise AuthError("Access token has expired.")
        except pyjwt.PyJWTError:
            raise AuthError("Invalid access token.")

        if payload.get("type") != "access":
            raise AuthError("Not an access token.")

        username: str = payload.get("sub", "")
        user = await self._repo.get_by_username(username)
        if not user or not user.is_active:
            raise AuthError("User not found or inactive.")
        return user
