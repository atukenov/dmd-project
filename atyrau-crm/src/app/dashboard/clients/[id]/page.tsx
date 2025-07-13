'use client';

import { useState, useEffect, use } from 'react';
import { formatDate } from '@/lib/utils/date-utils';
import Link from 'next/link';

interface ClientDetails {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

interface ClientAppointment {
  _id: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  service?: {
    name: string;
    duration: number;
    price: number;
  };
}

interface ClientNote {
  _id: string;
  content: string;
  type: string;
  createdAt: string;
  authorName: string;
}

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [noteData, setNoteData] = useState({
    content: '',
    type: 'general'
  });
  const [activeTab, setActiveTab] = useState<'appointments' | 'notes'>('appointments');
  
  // Fetch client details
  useEffect(() => {
    async function loadClientDetails() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch client details');
        }
        
        const data = await response.json();
        setClient(data.client);
        setAppointments(data.appointments || []);
        setNotes(data.notes || []);
        
        // Prepare form data for editing
        setFormData({
          name: data.client.name,
          phone: data.client.phone,
          email: data.client.email || '',
          notes: data.client.notes || ''
        });
      } catch (error) {
        console.error('Error fetching client details:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadClientDetails();
  }, [clientId]);
  
  async function fetchClientDetails() {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }
      
      const data = await response.json();
      setClient(data.client);
      setAppointments(data.appointments || []);
      setNotes(data.notes || []);
      
      // Prepare form data for editing
      setFormData({
        name: data.client.name,
        phone: data.client.phone,
        email: data.client.email || '',
        notes: data.client.notes || ''
      });
    } catch (error) {
      console.error('Error fetching client details:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleEditModalOpen() {
    setShowEditModal(true);
  }
  
  function handleAddNoteModalOpen() {
    setNoteData({
      content: '',
      type: 'general'
    });
    setShowAddNoteModal(true);
  }
  
  function handleModalClose() {
    setShowEditModal(false);
    setShowAddNoteModal(false);
  }
  
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  function handleNoteFormChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update client');
      }
      
      // Refresh client details
      await fetchClientDetails();
      handleModalClose();
    } catch (error) {
      console.error('Error updating client:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  }
  
  async function handleAddNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add note');
      }
      
      // Refresh client details
      await fetchClientDetails();
      handleModalClose();
      setActiveTab('notes'); // Switch to notes tab
    } catch (error) {
      console.error('Error adding note:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  }
  
  // Format time for display
  const formatTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };
  
  // Get status badge classes
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get payment status badge classes
  const getPaymentBadgeClasses = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get note type badge classes
  const getNoteBadgeClasses = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'preference':
        return 'bg-purple-100 text-purple-800';
      case 'medical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get note type label
  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return 'Общая заметка';
      case 'preference':
        return 'Предпочтение';
      case 'medical':
        return 'Медицинская информация';
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !client) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Клиент не найден'}
        </div>
        <div className="mt-4">
          <Link href="/dashboard/clients" className="text-blue-600 hover:underline">
            &larr; Назад к списку клиентов
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Назад к списку клиентов
        </Link>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-700">{client.name}</h1>
              <p className="text-gray-600">Клиент с {formatDate(new Date(client.createdAt))}</p>
            </div>
            <button
              onClick={handleEditModalOpen}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Редактировать
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Контактная информация</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-800 mr-3">Телефон:</span> 
                  <span className='text-gray-600'>{client.phone}</span>
                </p>
                {client.email && (
                  <p>
                    <span className="font-medium">Email:</span> {client.email}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              {client.notes && (
                <>
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Заметки о клиенте</h2>
                  <div className="bg-gray-50 p-3 rounded">
                    {client.notes}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`py-4 px-6 font-medium ${
                activeTab === 'appointments' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('appointments')}
            >
              История записей
            </button>
            <button
              className={`py-4 px-6 font-medium ${
                activeTab === 'notes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('notes')}
            >
              Заметки и предпочтения
            </button>
          </nav>
        </div>
        
        {activeTab === 'appointments' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">История записей</h2>
              <Link
                href={`/dashboard/appointments?client=${client._id}`}
                className="text-blue-600 hover:underline"
              >
                Создать запись
              </Link>
            </div>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                У этого клиента пока нет записей
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div
                    key={appointment._id}
                    className="border rounded-md p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-500">
                          {formatDate(new Date(appointment.startTime))} · {formatTimeDisplay(appointment.startTime)} - {formatTimeDisplay(appointment.endTime)}
                        </div>
                        
                        {appointment.service && (
                          <div className="text-sm text-gray-600 mt-1">
                            Услуга: {appointment.service.name} · {appointment.service.price} KZT
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="text-sm text-gray-600 mt-2">
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold mb-1 ${getStatusBadgeClasses(appointment.status)}`}>
                          {appointment.status === 'scheduled' && 'Запланировано'}
                          {appointment.status === 'completed' && 'Завершено'}
                          {appointment.status === 'cancelled' && 'Отменено'}
                          {appointment.status === 'no-show' && 'Не явился'}
                        </span>
                        
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getPaymentBadgeClasses(appointment.paymentStatus)}`}>
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
        )}
        
        {activeTab === 'notes' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Заметки о клиенте</h2>
              <button
                onClick={handleAddNoteModalOpen}
                className="text-blue-600 hover:underline"
              >
                Добавить заметку
              </button>
            </div>
            
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Нет заметок о клиенте. Нажмите &quot;Добавить заметку&quot;, чтобы создать первую.
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map(note => (
                  <div
                    key={note._id}
                    className="border rounded-md p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getNoteBadgeClasses(note.type)}`}>
                        {getNoteTypeLabel(note.type)}
                      </span>
                      <div className="text-sm text-gray-500">
                        {formatDate(new Date(note.createdAt))}
                      </div>
                    </div>
                    
                    <div className="whitespace-pre-wrap mb-2">{note.content}</div>
                    
                    <div className="text-sm text-gray-500 text-right">
                      Автор: {note.authorName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Редактировать клиента
            </h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Заметки
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Добавить заметку
            </h2>
            
            <form onSubmit={handleAddNoteSubmit} className="space-y-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Тип заметки
                </label>
                <select
                  id="type"
                  name="type"
                  value={noteData.type}
                  onChange={handleNoteFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="general">Общая заметка</option>
                  <option value="preference">Предпочтение</option>
                  <option value="medical">Медицинская информация</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Содержание *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={noteData.content}
                  onChange={handleNoteFormChange}
                  rows={5}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
