'use client';

import { useNotifications } from '@/components/providers/NotificationProvider';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NotificationManagement() {
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      default:
        return 'text-text-body';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-heading">
          🔔 Управление уведомлениями
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">
            Активных: {notifications.length}
          </span>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors text-sm"
            >
              Очистить все
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-content-bg border border-card-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🔕</div>
          <h3 className="text-lg font-medium text-heading mb-2">
            Нет активных уведомлений
          </h3>
          <p className="text-text-muted">
            Все уведомления будут отображаться здесь
          </p>
        </div>
      ) : (
        <div className="bg-content-bg border border-card-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-table-header-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                    Заголовок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                    Сообщение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                    Длительность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-border">
                {notifications.map((notification, index) => (
                  <tr 
                    key={notification.id}
                    className={`${
                      index % 2 === 0 ? 'bg-table-row-even' : 'bg-table-row-odd'
                    } hover:bg-table-row-hover transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {getTypeIcon(notification.type)}
                        </span>
                        <span className={`text-sm font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-heading">
                        {notification.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-body max-w-xs truncate">
                        {notification.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {formatDistanceToNow(notification.createdAt, { 
                        addSuffix: true, 
                        locale: ru 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {notification.duration 
                        ? notification.duration === 0 
                          ? 'Постоянное' 
                          : `${notification.duration / 1000}с`
                        : 'Авто'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="text-primary hover:text-primary-hover font-medium"
                          >
                            {notification.action.label}
                          </button>
                        )}
                        {notification.dismissible && (
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-error hover:text-error/80 font-medium"
                          >
                            Закрыть
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-content-bg border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-success">
            {notifications.filter(n => n.type === 'success').length}
          </div>
          <div className="text-sm text-text-muted">Успешные</div>
        </div>
        
        <div className="bg-content-bg border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-error">
            {notifications.filter(n => n.type === 'error').length}
          </div>
          <div className="text-sm text-text-muted">Ошибки</div>
        </div>
        
        <div className="bg-content-bg border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-warning">
            {notifications.filter(n => n.type === 'warning').length}
          </div>
          <div className="text-sm text-text-muted">Предупреждения</div>
        </div>
        
        <div className="bg-content-bg border border-card-border rounded-lg p-4">
          <div className="text-2xl font-bold text-info">
            {notifications.filter(n => n.type === 'info').length}
          </div>
          <div className="text-sm text-text-muted">Информационные</div>
        </div>
      </div>
    </div>
  );
}
