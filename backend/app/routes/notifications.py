from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.dependencies.auth import get_current_user
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


def get_notification_service():
    return NotificationService()


@router.get("")
async def get_notifications(
    unread_only: bool = Query(False, description="Return only unread notifications"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    """Get notifications for the current user."""
    notifications = await service.get_notifications(
        user_id=current_user["id"],
        unread_only=unread_only,
        skip=skip,
        limit=limit,
    )
    return notifications


@router.get("/unread-count")
async def get_unread_count(
    current_user=Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    """Get the number of unread notifications."""
    count = await service.get_unread_count(current_user["id"])
    return {"unread_count": count}


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    """Mark a single notification as read."""
    success = await service.mark_as_read(notification_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return {"message": "Notification marked as read"}


@router.patch("/read-all")
async def mark_all_read(
    current_user=Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    """Mark all notifications as read for the current user."""
    count = await service.mark_all_as_read(current_user["id"])
    return {"message": f"Marked {count} notifications as read", "count": count}
