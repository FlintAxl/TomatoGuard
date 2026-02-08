"""
Analytics API routes – ML-focused analytics for Admin Dashboard.
"""
from fastapi import APIRouter, Depends, Query
from app.dependencies.auth import get_current_admin_user
from app.services.database import get_database
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


def _get_service() -> AnalyticsService:
    db = get_database()
    return AnalyticsService(db)


@router.get("/ml-overview")
async def ml_overview(current_user: dict = Depends(get_current_admin_user)):
    """Full ML analytics payload in one request."""
    svc = _get_service()
    data = await svc.get_full_ml_analytics()
    return {"status": "success", "data": data}


@router.get("/overview")
async def overview(current_user: dict = Depends(get_current_admin_user)):
    """High level KPI cards."""
    svc = _get_service()
    return {"status": "success", "data": await svc.get_overview()}


@router.get("/disease-stats")
async def disease_stats(current_user: dict = Depends(get_current_admin_user)):
    """Disease detection statistics (0-filled)."""
    svc = _get_service()
    return {"status": "success", "data": await svc.get_disease_detection_stats()}


@router.get("/model-evaluation")
async def model_evaluation(current_user: dict = Depends(get_current_admin_user)):
    """Static model evaluation metrics."""
    svc = _get_service()
    return {"status": "success", "data": svc.get_model_evaluation()}


@router.get("/detection-trends")
async def detection_trends(
    days: int = Query(30, ge=7, le=90),
    current_user: dict = Depends(get_current_admin_user),
):
    """Daily detection counts per model."""
    svc = _get_service()
    return {"status": "success", "data": await svc.get_detection_trends(days=days)}


@router.get("/confidence-distribution")
async def confidence_distribution(current_user: dict = Depends(get_current_admin_user)):
    """Confidence bucket & per-disease avg."""
    svc = _get_service()
    return {"status": "success", "data": await svc.get_confidence_distribution()}


@router.get("/part-distribution")
async def part_distribution(current_user: dict = Depends(get_current_admin_user)):
    """Plant part distribution."""
    svc = _get_service()
    return {"status": "success", "data": await svc.get_part_distribution()}


@router.get("/recent-analyses")
async def recent_analyses(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_admin_user),
):
    """Recent analyses feed."""
    svc = _get_service()
    return {"status": "success", "data": await svc.get_recent_analyses(limit=limit)}
