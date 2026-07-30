"""Aztec PM — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="Aztec PM — Project Management API",
    description=(
        "Sistema de gestión de proyectos y tareas para operaciones de "
        "consultoría y automatización. Incluye detección automática de "
        "riesgo y priorización explicable."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = [o.strip() for o in settings.backend_cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Returns the current health status of the API.",
    response_description="API health status",
)
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "aztec-pm-backend", "version": "0.1.0"}
