import { getApiClient } from './client';

// ========== TYPES ==========

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type: string;
  message: string;
  author_id: string;
  author_name: string;
  post_id?: string;
  post_title?: string;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ========== API SERVICE ==========

export const notificationService = {
  /**
   * Get notifications for the current user
   */
  getNotifications: async (
    token: string,
    options?: { unreadOnly?: boolean; skip?: number; limit?: number }
  ): Promise<NotificationItem[]> => {
    const apiClient = getApiClient(token);
    const params = new URLSearchParams();

    if (options?.unreadOnly) params.append('unread_only', 'true');
    if (options?.skip) params.append('skip', options.skip.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    const url = `/api/v1/notifications${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (token: string): Promise<number> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.get('/api/v1/notifications/unread-count');
    return response.data.unread_count;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (token: string, notificationId: string): Promise<void> => {
    const apiClient = getApiClient(token);
    await apiClient.patch(`/api/v1/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (token: string): Promise<number> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.patch('/api/v1/notifications/read-all');
    return response.data.count;
  },
};
