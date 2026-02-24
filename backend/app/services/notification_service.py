from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.services.database import get_database


class NotificationService:
    def __init__(self):
        self.db = get_database()
        self.notifications = self.db.notifications
        self.users = self.db.users

    async def create_forum_post_notification(
        self,
        author_id: str,
        author_name: str,
        post_id: str,
        post_title: str,
    ) -> int:
        """
        Create a notification for all users (except the author) when a forum post is created.
        Returns the number of notifications created.
        """
        # Get all active users except the author
        cursor = self.users.find(
            {"_id": {"$ne": ObjectId(author_id)}, "is_active": True},
            {"_id": 1}
        )
        users = await cursor.to_list(length=1000)

        if not users:
            return 0

        # Build notification documents for each recipient
        now = datetime.utcnow()
        notifications = []
        for user in users:
            notifications.append({
                "recipient_id": str(user["_id"]),
                "type": "forum_post",
                "message": f"{author_name} posted in the forum",
                "author_id": author_id,
                "author_name": author_name,
                "post_id": post_id,
                "post_title": post_title,
                "is_read": False,
                "created_at": now,
            })

        result = await self.notifications.insert_many(notifications)
        print(f"🔔 Created {len(result.inserted_ids)} notifications for post '{post_title}'")
        return len(result.inserted_ids)

    async def get_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 50,
    ) -> List[dict]:
        """Get notifications for a user, newest first."""
        query = {"recipient_id": user_id}
        if unread_only:
            query["is_read"] = False

        cursor = (
            self.notifications.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)

        results = []
        for doc in docs:
            doc["id"] = str(doc.pop("_id"))
            results.append(doc)
        return results

    async def get_unread_count(self, user_id: str) -> int:
        """Return the number of unread notifications for a user."""
        return await self.notifications.count_documents(
            {"recipient_id": user_id, "is_read": False}
        )

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a single notification as read (only if it belongs to the user)."""
        result = await self.notifications.update_one(
            {"_id": ObjectId(notification_id), "recipient_id": user_id},
            {"$set": {"is_read": True}},
        )
        return result.modified_count > 0

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user. Returns count updated."""
        result = await self.notifications.update_many(
            {"recipient_id": user_id, "is_read": False},
            {"$set": {"is_read": True}},
        )
        return result.modified_count
