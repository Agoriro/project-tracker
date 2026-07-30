"""Risk router — endpoints for triggering portfolio risk evaluation."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.application.risk_engine import RiskEngineService
from app.infrastructure.database import get_db

# Admin endpoint, protected by authentication
router = APIRouter(
    prefix="/risk",
    tags=["Risk Engine"],
    dependencies=[Depends(get_current_user)],
)

def get_risk_engine(session: Annotated[AsyncSession, Depends(get_db)]) -> RiskEngineService:
    return RiskEngineService(session)

@router.post(
    "/evaluate",
    summary="Trigger full portfolio risk evaluation",
)
async def evaluate_portfolio(
    risk_engine: Annotated[RiskEngineService, Depends(get_risk_engine)],
):
    """Manually trigger the risk engine to scan all projects and update team member workloads.
    In a real-world scenario, this might also be called by a cron job or Celery task.
    """
    results = await risk_engine.evaluate_portfolio()
    return {"status": "success", "data": results}
