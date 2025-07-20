'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/lib/notifications/types';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (!notification.dismissible) return;
    
    setIsLeaving(true);
    // Wait for exit animation before removing
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-white border-success/30 border-l-4 border-l-success';
      case 'error':
        return 'bg-white border-error/30 border-l-4 border-l-error';
      case 'warning':
        return 'bg-white border-warning/30 border-l-4 border-l-warning';
      case 'info':
        return 'bg-white border-info/30 border-l-4 border-l-info';
      default:
        return 'bg-white border-card-border';
    }
  };

  return (
    <div
      className={`
        relative max-w-xl w-full bg-white shadow-modal rounded-lg border pointer-events-auto
        transition-all duration-300 ease-in-out transform
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getColorClasses()}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-heading">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {notification.message}
            </p>
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          {notification.dismissible && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleDismiss}
                className="inline-flex text-text-muted hover:text-text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
              >
                <span className="sr-only">Закрыть</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar for timed notifications */}
      {notification.duration !== undefined && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-card-border rounded-b-lg overflow-hidden">
          <div 
            className={`h-full notification-progress ${
              notification.type === 'success' ? 'bg-success' :
              notification.type === 'error' ? 'bg-error' :
              notification.type === 'warning' ? 'bg-warning' :
              notification.type === 'info' ? 'bg-info' : 'bg-primary'
            }`}
            style={{
              '--duration': `${notification.duration}ms`
            } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  );
}
