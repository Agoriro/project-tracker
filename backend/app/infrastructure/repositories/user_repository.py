"""User repository — database access for User entities."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities import User
from app.infrastructure.models import UserModel


class UserRepository:
    """Async repository for User persistence."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_username(self, username: str) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.username == username)
        )
        row = result.scalar_one_or_none()
        return _to_entity(row) if row else None

    async def get_by_id(self, user_id: int) -> User | None:
        row = await self._session.get(UserModel, user_id)
        return _to_entity(row) if row else None

    async def create(self, user: User) -> User:
        model = UserModel(
            username=user.username,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            is_active=user.is_active,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return _to_entity(model)

    async def exists(self, username: str) -> bool:
        result = await self._session.execute(
            select(UserModel.id).where(UserModel.username == username)
        )
        return result.scalar_one_or_none() is not None


def _to_entity(model: UserModel) -> User:
    return User(
        id=model.id,
        username=model.username,
        hashed_password=model.hashed_password,
        full_name=model.full_name,
        is_active=model.is_active,
        created_at=model.created_at,
    )
