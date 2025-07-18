'use client';

import { useNotifications } from '@/components/providers/NotificationProvider';
import NotificationToast from '@/components/molecules/NotificationToast';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Use portal to render notifications outside the component tree
  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col space-y-3 pointer-events-none"
      style={{ maxHeight: 'calc(100vh - 2rem)' }}
    >
      {notifications.slice(0, 5).map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
      
      {/* Show count if more than 5 notifications */}
      {notifications.length > 5 && (
        <div className="bg-content-bg border border-card-border rounded-lg p-3 text-sm text-text-muted text-center pointer-events-auto shadow-modal">
          +{notifications.length - 5} дополнительных уведомлений
        </div>
      )}
    </div>,
    document.body
  );
}
