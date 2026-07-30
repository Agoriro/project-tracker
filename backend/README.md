# Aztec PM - Backend

This is the backend service for Aztec Project Management, built with **Python 3.13** and **FastAPI**.

## Architecture

We implemented **Clean Architecture** to ensure the core business logic is completely isolated from external frameworks, databases, and delivery mechanisms.

### Layered Structure
- **Core (`core/`):** Contains the domain models, custom exceptions, and the `RiskEngineService` which executes the business logic for calculating portfolio risks without relying on any database specifics.
- **Application (`application/`):** Contains the Use Cases (e.g., `ProjectService`, `TaskService`). These services orchestrate data flow between the repository interfaces and the core business logic.
- **Infrastructure (`infrastructure/`):** Implements the database access using `SQLAlchemy` (async), `Alembic` for migrations, and PostgreSQL. It contains the concrete repositories (e.g., `SQLAlchemyProjectRepository`).
- **API (`api/`):** The delivery mechanism. FastAPI routers, request/response models (Pydantic), and dependency injection definitions.

### Why Clean Architecture?
1. **Testability:** We can test the `RiskEngineService` completely isolated from the database.
2. **Maintainability:** As Aztec PM scales, we can swap the underlying database or the web framework without touching the business rules.
3. **Separation of Concerns:** Developers know exactly where to put business rules vs. database queries.

## Risk Engine & Prioritization

The `RiskEngineService` executes a weighted prioritization algorithm. It analyzes metrics like the amount of overdue tasks and blocked statuses to assign a `risk_score` and a `risk_level` (Low, Medium, High). This calculation runs automatically upon project creation and updates.

## Setup & Running

The backend is intended to be run via Docker Compose from the root directory:

```bash
docker compose up --build backend
```

Upon startup, the `entrypoint.sh` script automatically runs Alembic migrations and executes `seed.py`, which populates the database using the provided Aztec Excel file.

## Testing

Tests are written using `pytest` and `httpx` for async API testing, using an isolated `aiosqlite` in-memory database to prevent side effects.

To run the test suite locally (assuming a virtual environment is active and dependencies are installed):

```bash
pytest
```
