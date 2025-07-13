'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useBusinessStore } from '@/store/businessStore';
import Link from 'next/link';

type RecentAppointment = {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  client: {
    name: string;
    phone: string;
  };
  service: {
    name: string;
    duration: number;
  };
};

export default function Dashboard() {
  const { data: session } = useSession();
  const { 
    businessId,
    businessName, 
    isBusinessSetup,
    setBusinessId,
    setBusinessName,
    setIsBusinessSetup 
  } = useBusinessStore();
  
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    appointmentsWeek: 0,
    clientsTotal: 0,
    revenue: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);

  // Check if the business has been set up and fetch business info
  useEffect(() => {
    const checkBusinessSetup = async () => {
      try {
        const response = await fetch('/api/business/check');
        const resData = await response.json();
        const data = resData.data;
        
        console.log('Business check response:', data); // Debug log
        
        // Update the global business store
        setIsBusinessSetup(data.hasSetup);
        
        // If business is setup, store the business ID and name
        if (data.hasSetup) {
          if (data.businessId) {
            console.log('Setting business ID:', data.businessId); // Debug log
            setBusinessId(data.businessId);
          }
          
          if (data.businessName) {
            console.log('Setting business name:', data.businessName); // Debug log
            setBusinessName(data.businessName);
          }
        }
      } catch (error) {
        console.error('Failed to check business setup:', error);
      }
    };

    checkBusinessSetup();
  }, [setBusinessId, setBusinessName, setIsBusinessSetup]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats with businessId:', businessId); // Debug log
        const response = await fetch(`/api/dashboard/stats?businessId=${businessId}`);
        const data = await response.json();
        
        console.log('Stats response:', data); // Debug log
        
        if (response.ok) {
          setStats(data);
        } else {
          console.error('Failed to fetch stats:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    // Only fetch stats if business is set up and businessId is available
    if (isBusinessSetup && businessId) {
      fetchStats();
    }
  }, [isBusinessSetup, businessId]);

  // Fetch recent appointments
  useEffect(() => {
    const fetchRecentAppointments = async () => {
      try {
        console.log('Fetching recent appointments with businessId:', businessId); // Debug log
        const response = await fetch(`/api/dashboard/recent-appointments?businessId=${businessId}`);
        const data = await response.json();
        
        console.log('Recent appointments response:', data); // Debug log
        
        if (response.ok) {
          setRecentAppointments(data);
        } else {
          console.error('Failed to fetch recent appointments:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch recent appointments:', error);
      }
    };

    // Only fetch recent appointments if business is set up and businessId is available
    if (isBusinessSetup && businessId) {
      fetchRecentAppointments();
    }
  }, [isBusinessSetup, businessId]);

  return (
    <div>
      <div className="mb-8">
        <div className='flex items-center justify-between'>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Добро пожаловать, {session?.user?.name || 'пользователь'}!
            </h1>
            {businessName && (
                <h1 className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-6 py-1 rounded-full text-xl">
                    💼 {businessName}
                </h1>
            )}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Вот сводка вашей деятельности на сегодня
        </p>
      </div>

      {!isBusinessSetup ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Настройте свой бизнес-профиль
              </h2>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Для начала работы необходимо настроить профиль вашего бизнеса.
            </p>
            <Link
              href="/settings/business-profile"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Настроить профиль
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Today's Appointments */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Записей сегодня
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.appointmentsToday}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href="/dashboard/appointments"
                    className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    Посмотреть все
                  </Link>
                </div>
              </div>
            </div>

            {/* Weekly Appointments */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Записей на неделю
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.appointmentsWeek}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href="/dashboard/appointments"
                    className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    Посмотреть все
                  </Link>
                </div>
              </div>
            </div>

            {/* Total Clients */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Всего клиентов
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.clientsTotal}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href="/dashboard/clients"
                    className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    Посмотреть всех
                  </Link>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Доход за месяц
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.revenue.toLocaleString()} ₸
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href="/dashboard/payments"
                    className="font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    Подробный отчет
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Ближайшие записи
            </h2>
            <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              {recentAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Нет запланированных записей на ближайшие дни
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentAppointments.map((appointment) => (
                    <li key={appointment._id}>
                      <div className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                              {appointment.client.name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                appointment.status === 'scheduled' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                                  : appointment.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                              }`}>
                                {appointment.status === 'scheduled' ? 'Запланировано' :
                                 appointment.status === 'confirmed' ? 'Подтверждено' : 'Ожидает'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                {appointment.service.name}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {appointment.service.duration} мин
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <p>
                                <time dateTime={appointment.startTime}>
                                  {new Date(appointment.startTime).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </time>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

