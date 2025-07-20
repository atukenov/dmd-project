'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDate } from '@/lib/utils/date-utils';
import { 
  Button, 
  SearchInput, 
  Card, 
  LoadingSpinner, 
  Notification
} from '@/components';
import { useNotifications } from '@/components/providers/NotificationProvider';

interface Client {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  stats: {
    appointmentCount: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    lastVisit: string | null;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalClients, setTotalClients] = useState<number>(0);
  const pageSize = 20;
  
  const { success, error: showError } = useNotifications();
  
  // Fetch clients
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const skip = (currentPage - 1) * pageSize;
      let url = `/api/clients/list?limit=${pageSize}&skip=${skip}`;
      
      if (searchQuery) {
        url += `&query=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      const result = await response.json();
      
      // Debug logging
      console.log('API Response:', result);
      
      // Check if the API call was successful
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch clients');
      }
      
      // Extract the data from the API response
      const data = result.data;
      console.log('Extracted data:', data);
      console.log('Clients array:', data.clients);
      
      setClients(data.clients || []);
      setTotalPages(data.totalPages || 1);
      setTotalClients(data.total || 0);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  function handleAddModalOpen() {
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
    setShowAddModal(true);
  }
  
  function handleModalClose() {
    setShowAddModal(false);
  }
  
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create client');
      }
      
      // Show success notification
      success(
        'Клиент добавлен!',
        `Клиент "${formData.name}" успешно добавлен в систему`
      );
      
      // Refresh clients list
      await fetchClients();
      handleModalClose();
    } catch (error) {
      console.error('Error creating client:', error);
      
      // Show error notification
      showError(
        'Ошибка при добавлении клиента',
        error instanceof Error ? error.message : 'Произошла неизвестная ошибка'
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text">Клиенты</h1>
        <Button
          onClick={handleAddModalOpen}
          variant="primary"
        >
          Добавить клиента
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <SearchInput
          placeholder="Поиск по имени, телефону или email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          showClearButton={!!searchQuery}
          onClear={() => {
            setSearchQuery('');
            setCurrentPage(1);
          }}
          fullWidth
        />
      </div>
      
      {/* Clients List */}
      {isLoading ? (
        <Card className="p-8">
          <LoadingSpinner size="lg" />
        </Card>
      ) : error ? (
        <Notification
          type="error"
          title="Ошибка загрузки"
          message={error}
        />
      ) : clients.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-text-secondary mb-4">
            {searchQuery ? 'Нет клиентов, соответствующих вашему поиску.' : 'У вас еще нет клиентов.'}
          </p>
          <Button
            onClick={handleAddModalOpen}
            variant="primary"
          >
            Добавить первого клиента
          </Button>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden" padding="none">
            <table className="min-w-full divide-y divide-card-border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Контакты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Визиты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Последний визит
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card-bg divide-y divide-card-border">
                {clients.map(client => (
                  <tr 
                    key={client._id} 
                    className="hover:bg-hover-bg cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/clients/${client._id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text">{client.name}</div>
                      <div className="text-sm text-text-secondary">
                        Клиент с {formatDate(new Date(client.createdAt))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">{client.phone}</div>
                      {client.email && (
                        <div className="text-sm text-text-secondary">{client.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                          {client.stats.appointmentCount} всего
                        </span>
                        <span className="bg-success/10 text-success text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                          {client.stats.completedAppointments} завершено
                        </span>
                        <span className="bg-error/10 text-error text-xs font-semibold px-2.5 py-0.5 rounded">
                          {client.stats.cancelledAppointments + client.stats.noShowAppointments} отменено/неявка
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.stats.lastVisit ? (
                        <div className="text-sm text-text">
                          {formatDate(new Date(client.stats.lastVisit))}
                        </div>
                      ) : (
                        <div className="text-sm text-text-secondary">Нет визитов</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Показано {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalClients)} из {totalClients} клиентов
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  &lt;
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  const startPage = Math.max(1, currentPage - 2);
                  const pageNum = startPage + i;
                  if (pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded border ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4" padding="large">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text">
                Добавить нового клиента
              </h2>
              <button
                onClick={handleModalClose}
                className="text-text-secondary hover:text-text"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">
                  Заметки
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Добавление...' : 'Добавить'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}


