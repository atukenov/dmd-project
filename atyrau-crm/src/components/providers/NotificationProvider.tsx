'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { Notification, NotificationContextType } from '@/lib/notifications/types';
import { notificationTemplates } from '@/lib/notifications/templates';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): string => {
    const id = generateId();
    const newNotification: Notification = {
      id,
      createdAt: new Date(),
      duration: notification.duration ?? 5000, // Default 5 seconds
      dismissible: notification.dismissible ?? true,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after duration (if > 0)
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== id)
        );
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const success = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const error = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: options?.duration ?? 8000, // Errors stay longer
      ...options,
    });
  }, [addNotification]);

  const warning = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: options?.duration ?? 6000,
      ...options,
    });
  }, [addNotification]);

  const info = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Hook for using predefined templates
export function useNotificationTemplates() {
  const { success, error, warning, info } = useNotifications();

  const notify = {
    // Authentication
    loginSuccess: () => success(notificationTemplates.loginSuccess.title, notificationTemplates.loginSuccess.message),
    loginError: () => error(notificationTemplates.loginError.title, notificationTemplates.loginError.message),
    logoutSuccess: () => success(notificationTemplates.logoutSuccess.title, notificationTemplates.logoutSuccess.message),
    registrationSuccess: () => success(notificationTemplates.registrationSuccess.title, notificationTemplates.registrationSuccess.message),

    // Business operations
    businessProfileSaved: () => success(notificationTemplates.businessProfileSaved.title, notificationTemplates.businessProfileSaved.message),
    businessProfileError: () => error(notificationTemplates.businessProfileError.title, notificationTemplates.businessProfileError.message),

    // Service management
    serviceCreated: () => success(notificationTemplates.serviceCreated.title, notificationTemplates.serviceCreated.message),
    serviceUpdated: () => success(notificationTemplates.serviceUpdated.title, notificationTemplates.serviceUpdated.message),
    serviceDeleted: () => success(notificationTemplates.serviceDeleted.title, notificationTemplates.serviceDeleted.message),
    serviceError: () => error(notificationTemplates.serviceError.title, notificationTemplates.serviceError.message),

    // Client management
    clientCreated: () => success(notificationTemplates.clientCreated.title, notificationTemplates.clientCreated.message),
    clientUpdated: () => success(notificationTemplates.clientUpdated.title, notificationTemplates.clientUpdated.message),
    clientDeleted: () => success(notificationTemplates.clientDeleted.title, notificationTemplates.clientDeleted.message),
    clientError: () => error(notificationTemplates.clientError.title, notificationTemplates.clientError.message),

    // Appointments
    appointmentCreated: () => success(notificationTemplates.appointmentCreated.title, notificationTemplates.appointmentCreated.message),
    appointmentUpdated: () => success(notificationTemplates.appointmentUpdated.title, notificationTemplates.appointmentUpdated.message),
    appointmentCancelled: () => warning(notificationTemplates.appointmentCancelled.title, notificationTemplates.appointmentCancelled.message),
    appointmentError: () => error(notificationTemplates.appointmentError.title, notificationTemplates.appointmentError.message),

    // Payments
    paymentSuccess: () => success(notificationTemplates.paymentSuccess.title, notificationTemplates.paymentSuccess.message),
    paymentPending: () => info(notificationTemplates.paymentPending.title, notificationTemplates.paymentPending.message),
    paymentError: () => error(notificationTemplates.paymentError.title, notificationTemplates.paymentError.message),

    // General
    saveSuccess: () => success(notificationTemplates.saveSuccess.title, notificationTemplates.saveSuccess.message),
    saveError: () => error(notificationTemplates.saveError.title, notificationTemplates.saveError.message),
    deleteSuccess: () => success(notificationTemplates.deleteSuccess.title, notificationTemplates.deleteSuccess.message),
    deleteError: () => error(notificationTemplates.deleteError.title, notificationTemplates.deleteError.message),
    networkError: () => error(notificationTemplates.networkError.title, notificationTemplates.networkError.message),
    validationError: () => warning(notificationTemplates.validationError.title, notificationTemplates.validationError.message),
  };

  return notify;
}
