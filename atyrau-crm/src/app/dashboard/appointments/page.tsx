'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/molecules/Calendar';
import { formatDate } from '@/lib/utils/date-utils';
import { getSession } from 'next-auth/react';
import { useBusinessStore } from '@/store/businessStore';
import { useAppointments } from '@/hooks/useAppointments';

interface Appointment {
  _id: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes: string;
  client: {
    name: string;
    phone: string;
    email: string;
  };
  service?: {
    name: string;
    duration: number;
    price: number;
  };
}

export default function AppointmentsPage() {
  const { businessId, businessName } = useBusinessStore();
  const { services, servicesLoading, servicesError, createAppointment, isCreating } = useAppointments();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState<boolean>(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    serviceId: '',
    startTime: `${selectedDate.toISOString().split('T')[0]}T09:00`,
    endTime: `${selectedDate.toISOString().split('T')[0]}T10:00`,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: ''
  });
  
  // Function to fetch appointments for the selected date
  const fetchAppointments = async () => {
    if (!selectedDate || !businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/appointments/list?businessId=${businessId}&startDate=${dateString}&endDate=${dateString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointments when selectedDate or businessId changes
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, businessId]);

  // Handle status change
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/appointments/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }
      
      // Refresh appointments list
      const updatedAppointments = appointments.map(appointment => {
        if (appointment._id === appointmentId) {
          return { 
            ...appointment, 
            status: newStatus as Appointment['status']
          };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      alert(`Failed to update appointment: ${error.message}`);
    }
  };

  // Handle payment status change
  const handlePaymentStatusChange = async (appointmentId: string, newPaymentStatus: string) => {
    try {
      const response = await fetch('/api/appointments/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          paymentStatus: newPaymentStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
      
      // Refresh appointments list
      const updatedAppointments = appointments.map(appointment => {
        if (appointment._id === appointmentId) {
          return { 
            ...appointment, 
            paymentStatus: newPaymentStatus as Appointment['paymentStatus']
          };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      alert(`Failed to update payment status: ${error.message}`);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string, reason: string) => {
    try {
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          cancellationReason: reason
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }
      
      // Refresh appointments list
      const updatedAppointments = appointments.map(appointment => {
        if (appointment._id === appointmentId) {
          return { 
            ...appointment, 
            status: 'cancelled' as Appointment['status']
          };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      alert(`Failed to cancel appointment: ${error.message}`);
    }
  };

  // Format time for display
  const formatTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate end time based on selected service duration
  const updateEndTime = (serviceId: string, startTimeStr: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService && startTimeStr) {
      // Parse the start time
      const startTime = new Date(startTimeStr);
      
      // Add the service duration in minutes to get end time
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);
      
      // Format endTime back to string format
      const endTimeStr = endTime.toISOString().slice(0, 16);
      
      setNewAppointmentData(prev => ({
        ...prev,
        endTime: endTimeStr
      }));
    }
  };

  // Handle form field changes
  const handleAppointmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for serviceId to calculate end time
    if (name === 'serviceId') {
      updateEndTime(value, newAppointmentData.startTime);
    }
    
    // Special handling for startTime to recalculate end time
    if (name === 'startTime') {
      updateEndTime(newAppointmentData.serviceId, value);
    }
    
    setNewAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new appointment creation
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAppointment(newAppointmentData);
      
      // Close form and refresh appointments
      setShowNewAppointmentForm(false);
      
      // Reset form data
      setNewAppointmentData({
        serviceId: '',
        startTime: `${selectedDate.toISOString().split('T')[0]}T09:00`,
        endTime: `${selectedDate.toISOString().split('T')[0]}T10:00`,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        notes: ''
      });
      
      // Refresh appointments for the selected date
      fetchAppointments();
      
      alert('Appointment created successfully');
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      alert(`Failed to create appointment: ${error.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Управление записями</h1>
      
      {!businessId && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200">
          <p className="font-bold">Внимание!</p>
          <p>Бизнес не выбран. Пожалуйста, выберите или создайте бизнес в настройках.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3 dark:text-white">Выберите дату</h2>
          <Calendar onSelectDate={setSelectedDate} selectedDate={selectedDate} />
        </div>
        
        {/* Appointments List */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">
              Записи на {formatDate(selectedDate)}
            </h2>
            <button 
              onClick={() => setShowNewAppointmentForm(true)} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Новая запись
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">
              {error}
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-gray-500 p-4 text-center">
              Нет записей на эту дату
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className={`border-l-4 p-4 rounded-r-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    appointment.status === 'cancelled' 
                      ? 'border-gray-400 bg-gray-50 dark:bg-gray-700' 
                      : appointment.status === 'completed' 
                      ? 'border-green-500 dark:border-green-400' 
                      : 'border-blue-500 dark:border-blue-400'
                  }`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold dark:text-white">{appointment.client.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTimeDisplay(appointment.startTime)} - {formatTimeDisplay(appointment.endTime)}
                      </p>
                      {appointment.service && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          Услуга: {appointment.service.name} ({appointment.service.duration} мин)
                        </p>
                      )}
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                        appointment.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : appointment.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : appointment.status === 'cancelled' 
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {appointment.status === 'scheduled' && 'Запланировано'}
                        {appointment.status === 'completed' && 'Завершено'}
                        {appointment.status === 'cancelled' && 'Отменено'}
                        {appointment.status === 'no-show' && 'Не явился'}
                      </span>
                      
                      <span className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold ${
                        appointment.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : appointment.paymentStatus === 'refunded' 
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {appointment.paymentStatus === 'paid' && 'Оплачено'}
                        {appointment.paymentStatus === 'refunded' && 'Возмещено'}
                        {appointment.paymentStatus === 'pending' && 'Ожидает оплаты'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* New Appointment Form Modal */}
      {showNewAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Создать новую запись</h2>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              {/* Service Selection */}
              <div>
                <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Услуга *
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={newAppointmentData.serviceId}
                  onChange={handleAppointmentFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                >
                  <option value="">Выберите услугу</option>
                  {servicesLoading ? (
                    <option disabled>Загрузка услуг...</option>
                  ) : servicesError ? (
                    <option disabled>Ошибка загрузки услуг</option>
                  ) : (
                    services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.duration} мин, {service.price} KZT)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Дата и время начала *
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={newAppointmentData.startTime}
                    onChange={handleAppointmentFormChange}
                    required
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Время окончания
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={newAppointmentData.endTime}
                    onChange={handleAppointmentFormChange}
                    disabled
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md bg-gray-100 dark:bg-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Рассчитывается автоматически</p>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Имя клиента *
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={newAppointmentData.clientName}
                  onChange={handleAppointmentFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={newAppointmentData.clientPhone}
                  onChange={handleAppointmentFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={newAppointmentData.clientEmail}
                  onChange={handleAppointmentFormChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Заметки
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newAppointmentData.notes}
                  onChange={handleAppointmentFormChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentForm(false)}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                >
                  {isCreating ? 'Создание...' : 'Создать запись'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Детали записи</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Клиент</p>
                <p className="font-semibold dark:text-white">{selectedAppointment.client.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Контактная информация</p>
                <p className="dark:text-white">{selectedAppointment.client.phone}</p>
                {selectedAppointment.client.email && (
                  <p className="dark:text-white">{selectedAppointment.client.email}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Дата</p>
                  <p className="dark:text-white">{formatDate(new Date(selectedAppointment.startTime))}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Время</p>
                  <p className="dark:text-white">
                    {formatTimeDisplay(selectedAppointment.startTime)} - {formatTimeDisplay(selectedAppointment.endTime)}
                  </p>
                </div>
              </div>
              
              {selectedAppointment.service && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Услуга</p>
                  <p className="dark:text-white">{selectedAppointment.service.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAppointment.service.duration} мин · {selectedAppointment.service.price} KZT
                  </p>
                </div>
              )}
              
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Заметки</p>
                  <p className="dark:text-white">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Статус записи</p>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  value={selectedAppointment.status}
                  onChange={(e) => handleStatusChange(selectedAppointment._id, e.target.value)}
                  disabled={selectedAppointment.status === 'cancelled'}
                >
                  <option value="scheduled">Запланировано</option>
                  <option value="completed">Завершено</option>
                  <option value="no-show">Не явился</option>
                  <option value="cancelled" disabled>Отменено</option>
                </select>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Статус оплаты</p>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  value={selectedAppointment.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(selectedAppointment._id, e.target.value)}
                  disabled={selectedAppointment.status === 'cancelled'}
                >
                  <option value="pending">Ожидает оплаты</option>
                  <option value="paid">Оплачено</option>
                  <option value="refunded">Возмещено</option>
                </select>
              </div>
              
              {selectedAppointment.status !== 'cancelled' && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Отменить запись</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Причина отмены"
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      id="cancellationReason"
                    />
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      onClick={() => {
                        const reason = (document.getElementById('cancellationReason') as HTMLInputElement).value;
                        handleCancelAppointment(selectedAppointment._id, reason);
                      }}
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
                onClick={() => setSelectedAppointment(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
