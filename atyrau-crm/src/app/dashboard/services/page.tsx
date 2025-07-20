'use client';

import { useState } from 'react';
import { useBusinessStore } from '@/store/businessStore';
import { useServices } from '@/hooks/useServices';
import { Button, SearchInput } from '@/components';
import { Service } from '@/types/models';
import { useNotifications } from '@/components/providers/NotificationProvider';

type ServiceFormData = {
  id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
};

const categories = [
  { id: 'haircuts', name: 'Стрижки' },
  { id: 'coloring', name: 'Окрашивание' },
  { id: 'styling', name: 'Укладки' },
  { id: 'treatments', name: 'Уходовые процедуры' },
  { id: 'nails', name: 'Маникюр/Педикюр' },
  { id: 'makeup', name: 'Макияж' },
  { id: 'massage', name: 'Массаж' },
  { id: 'spa', name: 'СПА-процедуры' },
  { id: 'other', name: 'Другое' },
];

export default function ServicesPage() {
  const { businessId } = useBusinessStore();
  const { services, loading, error, refetch } = useServices();
  const { success, error: showError, warning } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showInactiveServices, setShowInactiveServices] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const initialFormData: ServiceFormData = {
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: 'other',
    isActive: true,
  };

  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);

  // Filter services based on search term, category, and active status
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      searchTerm === '' || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === '' || 
      service.category === categoryFilter;
    
    const matchesActiveStatus = 
      showInactiveServices || 
      service.isActive;
    
    return matchesSearch && matchesCategory && matchesActiveStatus;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setSubmitError(null);
  };

  // Open modal for creating a new service
  // Handle adding a new service
  const handleAddService = () => {
    if (!businessId) {
      warning(
        'Бизнес не выбран',
        'Пожалуйста, выберите или создайте бизнес в настройках перед добавлением услуг'
      );
      return;
    }
    
    resetForm();
    setIsEditMode(false);
    setShowModal(true);
  };

  // Open modal for editing an existing service
  const handleEditService = (service: Service) => {
    setIsEditMode(true);
    setFormData({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      isActive: service.isActive,
    });
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isEditMode && formData.id) {
        // Update existing service
        const response = await fetch(`/api/business/${businessId}/services/${formData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update service');
        }

        // Show success notification for update
        success(
          'Услуга обновлена!',
          `Услуга "${formData.name}" успешно обновлена`
        );
      } else {
        // Create new service
        const response = await fetch(`/api/business/${businessId}/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create service');
        }

        // Show success notification for create
        success(
          'Услуга создана!',
          `Услуга "${formData.name}" успешно добавлена в систему`
        );
      }

      // Refresh services list
      await refetch();
      
      // Close modal and reset form
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting service:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Show error notification
      showError(
        isEditMode ? 'Ошибка при обновлении услуги' : 'Ошибка при создании услуги',
        errorMessage
      );
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle service deletion
  const handleDeleteService = async (serviceId: string | undefined) => {
    if (!serviceId) return;
    
    if (confirmDelete !== serviceId) {
      setConfirmDelete(serviceId);
      // Show warning notification about confirmation needed
      warning(
        'Подтвердите удаление',
        'Нажмите кнопку удаления еще раз для подтверждения'
      );
      return;
    }

    // Find the service name for the notification
    const serviceToDelete = services.find(s => s.id === serviceId);
    const serviceName = serviceToDelete?.name || 'Услуга';

    try {
      const response = await fetch(`/api/business/${businessId}/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }

      // Show success notification
      success(
        'Услуга удалена!',
        `Услуга "${serviceName}" успешно удалена`
      );

      // Refresh services list
      await refetch();
      
      // Reset confirmation
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      
      // Show error notification
      showError(
        'Ошибка при удалении услуги',
        error instanceof Error ? error.message : 'Произошла неизвестная ошибка'
      );
    }
  };

  // Cancel delete confirmation
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    setIsEditMode(false);
    setSubmitError(null);
  };

  // Get category display name
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Другое';
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Управление услугами</h1>
          <p className="text-text-muted mt-1">Управляйте услугами вашего бизнеса</p>
        </div>
        <Button
          onClick={handleAddService}
          variant="primary"
          disabled={!businessId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Добавить услугу
        </Button>
      </div>

      {!businessId ? (
        <div className="bg-warning/10 border-l-4 border-warning text-warning-dark p-4 mb-6 rounded-r-md">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-bold">Внимание!</p>
              <p>Бизнес не выбран. Пожалуйста, выберите или создайте бизнес в настройках.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-content-bg rounded-lg shadow-card border border-card-border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск услуг..."
                fullWidth
                showClearButton
                onClear={() => setSearchTerm('')}
              />

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-input-border bg-input-bg text-text rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="">Все категории</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Show Inactive Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-inactive"
                  checked={showInactiveServices}
                  onChange={() => setShowInactiveServices(!showInactiveServices)}
                  className="h-4 w-4 text-primary focus:ring-primary/20 focus:ring-2 border-input-border rounded"
                />
                <label htmlFor="show-inactive" className="ml-2 block text-sm text-text-body">
                  Показать неактивные услуги
                </label>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="bg-content-bg rounded-lg shadow-card border border-card-border overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary animate-spin">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 mb-2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                <span className="text-4xl mb-4">📋</span>
                <p className="text-lg font-medium text-text">Нет услуг для отображения</p>
                <p className="text-sm mt-1">Добавьте новую услугу, нажав кнопку «Добавить услугу»</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-card-border">
                  <thead className="bg-table-header-bg">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                        Название
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                        Категория
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                        Длительность
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                        Цена
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-table-header-text uppercase tracking-wider">
                        Статус
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-table-header-text uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card-bg divide-y divide-card-border">
                    {filteredServices.map((service) => (
                      <tr key={service.id || service.name} className={`hover:bg-table-row-hover cursor-pointer transition-colors ${!service.isActive ? 'opacity-75' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-text">{service.name}</div>
                          <div className="text-sm text-text-muted truncate max-w-xs">{service.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text">{getCategoryName(service.category)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text">{service.duration} мин</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text">{service.price} ₸</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            service.isActive 
                              ? 'bg-success/10 text-success' 
                              : 'bg-card-muted text-text-muted'
                          }`}>
                            {service.isActive ? 'Активна' : 'Неактивна'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditService(service);
                              }}
                              className="text-primary hover:text-primary-hover transition-colors"
                              disabled={!service.id}
                              title="Редактировать"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            {confirmDelete === service.id ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteService(service.id);
                                  }}
                                  className="text-success hover:text-success/80 transition-colors"
                                  disabled={!service.id}
                                  title="Подтвердить удаление"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelDelete();
                                  }}
                                  className="text-text-muted hover:text-text transition-colors"
                                  title="Отменить"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteService(service.id);
                                }}
                                className="text-error hover:text-error/80 transition-colors"
                                disabled={!service.id}
                                title="Удалить"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <polyline points="3,6 5,6 21,6"></polyline>
                                  <path d="M19,6L19,20a2,2 0 0,1 -2,2L7,22a2,2 0 0,1 -2,-2L5,6"></path>
                                  <path d="M8,6L8,4a2,2 0 0,1 2,-2L14,2a2,2 0 0,1 2,2L16,6"></path>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-modal-overlay flex items-center justify-center z-50">
          <div className="bg-modal-bg border border-modal-border rounded-lg max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto shadow-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text">
                {isEditMode ? 'Редактировать услугу' : 'Добавить новую услугу'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-text-muted hover:text-text transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="bg-error/10 border-l-4 border-error text-error p-4 rounded-r-md">
                  <p>{submitError}</p>
                </div>
              )}

              {/* Service Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                  Название услуги *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
                  Описание
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">
                  Категория
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Duration and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-text-secondary mb-1">
                    Длительность (мин) *
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="5"
                    step="5"
                    required
                    className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-1">
                    Цена (₸) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="50"
                    required
                    className="w-full px-3 py-2 border border-input-border rounded-md bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary/20 border-input-border rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-text">
                  Услуга активна
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isEditMode ? 'Обновить' : 'Создать'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


