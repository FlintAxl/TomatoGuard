// TomatoGuardExpo/contexts/NotificationContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService, NotificationItem } from '../services/api/notificationService';
import { useAuth } from './AuthContext';

// ========== TYPES ==========

interface NotificationContextData {
  // Existing analysis notifications
  hasNewAnalysis: boolean;
  newAnalysisCount: number;
  triggerNotification: () => void;
  markAsSeen: () => void;

  // Forum notifications (server-side)
  forumNotifications: NotificationItem[];
  forumUnreadCount: number;
  hasForumNotifications: boolean;
  refreshForumNotifications: () => Promise<void>;
  markForumNotificationRead: (notificationId: string) => Promise<void>;
  markAllForumNotificationsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

const STORAGE_KEY = '@notification_count';
const POLL_INTERVAL = 30000; // 30 seconds

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const token = authState.accessToken;

  // ========== ANALYSIS NOTIFICATIONS (local) ==========
  const [newAnalysisCount, setNewAnalysisCount] = useState(0);

  useEffect(() => {
    loadStoredCount();
  }, []);

  const loadStoredCount = async () => {
    try {
      const storedCount = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedCount !== null) {
        setNewAnalysisCount(parseInt(storedCount, 10));
      }
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const saveCount = async (count: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, count.toString());
    } catch (error) {
      console.error('Failed to save notification count:', error);
    }
  };

  const triggerNotification = useCallback(() => {
    setNewAnalysisCount((prev) => {
      const newCount = prev + 1;
      saveCount(newCount);
      return newCount;
    });
  }, []);

  const markAsSeen = useCallback(() => {
    setNewAnalysisCount(0);
    saveCount(0);
  }, []);

  const hasNewAnalysis = newAnalysisCount > 0;

  // ========== FORUM NOTIFICATIONS (server-side) ==========
  const [forumNotifications, setForumNotifications] = useState<NotificationItem[]>([]);
  const [forumUnreadCount, setForumUnreadCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshForumNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const [notifications, count] = await Promise.all([
        notificationService.getNotifications(token, { limit: 50 }),
        notificationService.getUnreadCount(token),
      ]);
      setForumNotifications(notifications);
      setForumUnreadCount(count);
    } catch (error) {
      // Silently fail – polling will retry
      console.log('Failed to fetch forum notifications:', error);
    }
  }, [token]);

  const markForumNotificationRead = useCallback(async (notificationId: string) => {
    if (!token) return;
    try {
      await notificationService.markAsRead(token, notificationId);
      setForumNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setForumUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [token]);

  const markAllForumNotificationsRead = useCallback(async () => {
    if (!token) return;
    try {
      await notificationService.markAllAsRead(token);
      setForumNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setForumUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [token]);

  // Poll for new forum notifications when logged in
  useEffect(() => {
    if (token) {
      // Fetch immediately
      refreshForumNotifications();

      // Set up polling
      pollRef.current = setInterval(refreshForumNotifications, POLL_INTERVAL);
    } else {
      // Clear when logged out
      setForumNotifications([]);
      setForumUnreadCount(0);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [token, refreshForumNotifications]);

  const hasForumNotifications = forumUnreadCount > 0;

  return (
    <NotificationContext.Provider
      value={{
        // Analysis
        hasNewAnalysis,
        newAnalysisCount,
        triggerNotification,
        markAsSeen,

        // Forum
        forumNotifications,
        forumUnreadCount,
        hasForumNotifications,
        refreshForumNotifications,
        markForumNotificationRead,
        markAllForumNotificationsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
