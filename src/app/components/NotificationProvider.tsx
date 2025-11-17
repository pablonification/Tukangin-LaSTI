'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import NotificationModal from '@/app/components/NotificationModal';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showConfirm: (
    message: string,
    title?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmLabel?: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      duration: notification.duration || 5000,
    };

    setActiveNotification(newNotification);

    // Auto-hide after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        hideNotification(newNotification.id);
      }, newNotification.duration);
    }
  };

  const hideNotification = (id: string) => {
    if (activeNotification?.id === id) {
      setActiveNotification(null);
    }
  };

  const showSuccess = (message: string, title = 'Success', duration = 5000) => {
    showNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  };

  const showError = (message: string, title = 'Error', duration = 7000) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration,
    });
  };

  const showWarning = (message: string, title = 'Warning', duration = 6000) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  };

  const showInfo = (message: string, title = 'Information', duration = 5000) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  };

  const showConfirm = (
    message: string,
    title = 'Confirm Action',
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmLabel = 'Confirm'
  ) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration: 0, // Don't auto-hide confirmation dialogs
      action: {
        label: confirmLabel,
        onClick: () => {
          onConfirm?.();
          hideNotification(activeNotification!.id);
        },
      },
    });
  };

  const contextValue: NotificationContextType = {
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {activeNotification && (
        <NotificationModal
          notification={activeNotification}
          onClose={() => hideNotification(activeNotification.id)}
          onAction={activeNotification.action?.onClick}
        />
      )}
    </NotificationContext.Provider>
  );
};
