"""
Analytics API routes – ML-focused analytics for Admin Dashboard.
"""
from fastapi import APIRouter, Depends, Query
from app.dependencies.auth import get_current_admin_user, get_current_active_user
from app.services.database import get_database
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


def _get_service() -> AnalyticsService:
    db = get_database()
    return AnalyticsService(db)


@router.get("/featured-disease-spotlight")
async def featured_disease_spotlight(
    days: int = Query(30, ge=7, le=90),
    current_user: dict = Depends(get_current_active_user),
):
    """Featured disease spotlight for the Trends tab – any authenticated user."""
    svc = _get_service()
    data = await svc.get_featured_disease_spotlight(days=days)
    return {"status": "success", "data": data}


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


@router.get("/analysis-history")
async def analysis_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=5, le=100),
    current_user: dict = Depends(get_current_admin_user),
):
    """Paginated analysis history."""
    svc = _get_service()
    return {"status": "success", "data": await svc.get_analysis_history(page=page, page_size=page_size)}


@router.get("/analysis-detail/{analysis_id}")
async def analysis_detail(
    analysis_id: str,
    current_user: dict = Depends(get_current_admin_user),
):
    """Full analysis detail with images."""
    from fastapi import HTTPException
    svc = _get_service()
    detail = await svc.get_analysis_detail(analysis_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"status": "success", "data": detail}


@router.delete("/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_admin_user),
):
    """Delete a single analysis record."""
    from fastapi import HTTPException
    svc = _get_service()
    deleted = await svc.delete_analysis(analysis_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"status": "success", "message": "Analysis deleted successfully"}
