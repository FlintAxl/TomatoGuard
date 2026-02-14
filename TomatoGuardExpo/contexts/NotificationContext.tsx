// TomatoGuardExpo/contexts/NotificationContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationContextData {
  hasNewAnalysis: boolean;
  newAnalysisCount: number;
  triggerNotification: () => void;
  markAsSeen: () => void;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

const STORAGE_KEY = '@notification_count';

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newAnalysisCount, setNewAnalysisCount] = useState(0);

  // Load stored notification count on mount
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

  return (
    <NotificationContext.Provider
      value={{
        hasNewAnalysis,
        newAnalysisCount,
        triggerNotification,
        markAsSeen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
