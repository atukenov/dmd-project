'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    avatar: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setMessage('Profile updated successfully');
      setIsEditing(false);
    } catch ($1: unknown) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Мой профиль</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Управление личной информацией и настройками
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Личная информация
                </h3>
                {!isEditing && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-4">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="User avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                          {formData.name.charAt(0) || formData.email.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Фото профиля
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-800/40"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        PNG или JPG, максимум 1MB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Имя"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        fullWidth
                      />
                    </div>

                    <div>
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        fullWidth
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Для изменения email обратитесь к администратору
                      </p>
                    </div>

                    <div>
                      <Input
                        label="Телефон"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+7 (XXX) XXX-XX-XX"
                        fullWidth
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
                      <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4">
                      <p className="text-green-700 dark:text-green-400">{message}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setIsEditing(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </div>
                </form>
              ) : (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Имя</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {session?.user?.name || 'Не указано'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {session?.user?.email}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Телефон</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      Не указан
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Роль</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {session?.user?.role === 'admin'
                        ? 'Администратор'
                        : session?.user?.role === 'business'
                        ? 'Бизнес'
                        : 'Клиент'}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </Card>

          {/* Account Security */}
          <Card className="overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-5">
                Безопасность аккаунта
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Пароль</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Последнее обновление: никогда
                    </p>
                  </div>
                  <Button variant="secondary">Изменить пароль</Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Двухфакторная аутентификация
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Не включена
                    </p>
                  </div>
                  <Button variant="secondary" disabled>
                    Настроить
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-5">
                Настройки
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email-уведомления
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Получайте уведомления о новых записях и акциях
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      SMS-уведомления
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Получайте SMS о статусе ваших записей
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

