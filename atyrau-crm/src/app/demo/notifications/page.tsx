'use client';

import { useNotifications, useNotificationTemplates } from '@/components/providers/NotificationProvider';

export default function NotificationDemo() {
  const { success, error, warning, info, addNotification } = useNotifications();
  const notify = useNotificationTemplates();

  const handleCustomNotification = () => {
    addNotification({
      type: 'info',
      title: 'Пользовательское уведомление',
      message: 'Это пример пользовательского уведомления с действием',
      duration: 10000,
      action: {
        label: 'Открыть настройки',
        onClick: () => alert('Переход к настройкам')
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-heading mb-6">
        🔔 Демо системы уведомлений
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Notifications */}
        <div className="bg-content-bg border border-card-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-heading mb-4">
            Базовые уведомления
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => success('Успех!', 'Операция выполнена успешно')}
              className="w-full px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
            >
              Success Notification
            </button>
            
            <button
              onClick={() => error('Ошибка!', 'Что-то пошло не так')}
              className="w-full px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
            >
              Error Notification
            </button>
            
            <button
              onClick={() => warning('Предупреждение!', 'Проверьте введенные данные')}
              className="w-full px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors"
            >
              Warning Notification
            </button>
            
            <button
              onClick={() => info('Информация', 'Дополнительная информация для пользователя')}
              className="w-full px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 transition-colors"
            >
              Info Notification
            </button>
          </div>
        </div>

        {/* Template Notifications */}
        <div className="bg-content-bg border border-card-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-heading mb-4">
            Шаблонные уведомления
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => notify.serviceCreated()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Услуга создана
            </button>
            
            <button
              onClick={() => notify.clientUpdated()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Клиент обновлен
            </button>
            
            <button
              onClick={() => notify.appointmentCreated()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Запись создана
            </button>
            
            <button
              onClick={() => notify.paymentSuccess()}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Платеж успешен
            </button>
          </div>
        </div>

        {/* Advanced Notifications */}
        <div className="bg-content-bg border border-card-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-heading mb-4">
            Продвинутые уведомления
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleCustomNotification}
              className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              С действием
            </button>
            
            <button
              onClick={() => addNotification({
                type: 'warning',
                title: 'Длительное уведомление',
                message: 'Это уведомление будет показано 15 секунд',
                duration: 15000
              })}
              className="w-full px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors"
            >
              Длительное (15с)
            </button>
            
            <button
              onClick={() => addNotification({
                type: 'error',
                title: 'Постоянное уведомление',
                message: 'Это уведомление нужно закрыть вручную',
                duration: 0
              })}
              className="w-full px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
            >
              Постоянное
            </button>
            
            <button
              onClick={() => {
                for(let i = 0; i < 7; i++) {
                  setTimeout(() => {
                    success(`Уведомление ${i + 1}`, `Массовое уведомление номер ${i + 1}`);
                  }, i * 200);
                }
              }}
              className="w-full px-4 py-2 bg-diamond text-white rounded-lg hover:bg-diamond/90 transition-colors"
            >
              Множественные (7шт)
            </button>
          </div>
        </div>

        {/* Business Logic Examples */}
        <div className="bg-content-bg border border-card-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-heading mb-4">
            Примеры бизнес-логики
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                // Simulate login
                setTimeout(() => notify.loginSuccess(), 500);
              }}
              className="w-full px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
            >
              Имитация входа
            </button>
            
            <button
              onClick={() => {
                // Simulate network error
                notify.networkError();
              }}
              className="w-full px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
            >
              Ошибка сети
            </button>
            
            <button
              onClick={() => {
                // Simulate form validation error
                notify.validationError();
              }}
              className="w-full px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors"
            >
              Ошибка валидации
            </button>
            
            <button
              onClick={() => {
                // Simulate business profile save
                notify.businessProfileSaved();
              }}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Профиль сохранен
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-content-bg border border-card-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-heading mb-4">
          📋 Описание системы уведомлений
        </h2>
        <div className="prose prose-sm text-text-body">
          <ul className="space-y-2">
            <li><strong>Типы:</strong> Success, Error, Warning, Info</li>
            <li><strong>Автоматическое закрытие:</strong> Настраиваемое время (по умолчанию 5 секунд)</li>
            <li><strong>Действия:</strong> Кнопки с пользовательскими функциями</li>
            <li><strong>Постоянные:</strong> Уведомления, которые не закрываются автоматически</li>
            <li><strong>Анимации:</strong> Плавное появление и исчезновение</li>
            <li><strong>Лимит:</strong> Максимум 5 уведомлений на экране</li>
            <li><strong>Шаблоны:</strong> Готовые тексты для типовых операций</li>
            <li><strong>API интеграция:</strong> Автоматические уведомления для CRUD операций</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
