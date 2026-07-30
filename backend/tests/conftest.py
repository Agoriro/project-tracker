"""Pytest configuration and shared fixtures for the backend."""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.infrastructure.database import Base, get_db
from app.main import app

# Use a separate test database or override the URL if needed.
# For simplicity in this demo, we'll use the main DB URL but wrap tests in transactions
# that rollback, or use a SQLite in-memory DB if preferred.
# Here we'll configure a SQLite in-memory DB for fast, isolated tests.
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=None,
)

TestingSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db() -> AsyncGenerator[None, None]:
    """Create tables before each test and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an async session for tests."""
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an AsyncClient for FastAPI endpoint testing."""
    # Override the dependency to use the test session
    app.dependency_overrides[get_db] = lambda: db_session
    
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
        
    app.dependency_overrides.clear()
