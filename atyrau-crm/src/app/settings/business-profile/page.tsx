'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessStore } from '@/store/businessStore';
import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { Input } from '../../../components/atoms/Input';

// Business categories for Atyrau
const BUSINESS_CATEGORIES = [
  { id: 'beauty', name: 'Красота и здоровье' },
  { id: 'fitness', name: 'Фитнес и спорт' },
  { id: 'food', name: 'Рестораны и кафе' },
  { id: 'education', name: 'Образование' },
  { id: 'health', name: 'Медицина' },
  { id: 'auto', name: 'Автосервис' },
  { id: 'cleaning', name: 'Клининг' },
  { id: 'repair', name: 'Ремонт и строительство' },
  { id: 'other', name: 'Другое' },
];

type Step = 'info' | 'address' | 'services' | 'hours' | 'photos' | 'confirmation';

export default function BusinessProfileSetup() {
  const router = useRouter();
  const { businessId, setBusinessId, setBusinessName, setIsBusinessSetup } = useBusinessStore();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  // Form data
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
  });
  
  const [address, setAddress] = useState({
    street: '',
    building: '',
    city: 'Атырау',
    postalCode: '',
    landmark: '',
  });
  
  const [services, setServices] = useState([
    { id: '1', name: '', duration: 60, price: 0, description: '' }
  ]);
  
  const [workingHours, setWorkingHours] = useState({
    monday: { isOpen: true, from: '09:00', to: '18:00' },
    tuesday: { isOpen: true, from: '09:00', to: '18:00' },
    wednesday: { isOpen: true, from: '09:00', to: '18:00' },
    thursday: { isOpen: true, from: '09:00', to: '18:00' },
    friday: { isOpen: true, from: '09:00', to: '18:00' },
    saturday: { isOpen: true, from: '10:00', to: '16:00' },
    sunday: { isOpen: false, from: '10:00', to: '16:00' },
  });
  
  const [photos, setPhotos] = useState({
    logo: null,
    coverImage: null,
    galleryImages: [],
  });

  // Load existing business data
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        setIsLoadingData(true);
        
        // First, check if user has a business setup
        const checkResponse = await fetch('/api/business/check');
        
        if (!checkResponse.ok) {
          throw new Error('Failed to check business setup');
        }

        const checkData = await checkResponse.json();
        
        // If user has a business, load its data
        if (checkData.data?.hasSetup && checkData.data?.businessId) {
          const businessResponse = await fetch(`/api/business/${checkData.data.businessId}`);
          
          if (businessResponse.ok) {
            const businessData = await businessResponse.json();
            
            // Handle nested response structure
            const actualData = businessData.data?.data || businessData.data || businessData;
            
            // Populate form with existing data
            if (actualData.info) {
              setBusinessInfo({
                name: actualData.info.name || '',
                category: actualData.info.category || '',
                description: actualData.info.description || '',
                phone: actualData.info.phone || '',
                email: actualData.info.email || '',
              });
            }
            
            if (actualData.address) {
              setAddress({
                street: actualData.address.street || '',
                building: actualData.address.building || '',
                city: actualData.address.city || 'Атырау',
                postalCode: actualData.address.postalCode || '',
                landmark: actualData.address.landmark || '',
              });
            }
            
            if (actualData.services && actualData.services.length > 0) {
              setServices(actualData.services.map((service: { id?: string; name?: string; duration?: number; price?: number; description?: string }, index: number) => ({
                id: service.id || `service-${index}`,
                name: service.name || '',
                duration: service.duration || 60,
                price: service.price || 0,
                description: service.description || ''
              })));
            }
            
            if (actualData.workingHours) {
              setWorkingHours({
                monday: actualData.workingHours.monday || { isOpen: true, from: '09:00', to: '18:00' },
                tuesday: actualData.workingHours.tuesday || { isOpen: true, from: '09:00', to: '18:00' },
                wednesday: actualData.workingHours.wednesday || { isOpen: true, from: '09:00', to: '18:00' },
                thursday: actualData.workingHours.thursday || { isOpen: true, from: '09:00', to: '18:00' },
                friday: actualData.workingHours.friday || { isOpen: true, from: '09:00', to: '18:00' },
                saturday: actualData.workingHours.saturday || { isOpen: true, from: '10:00', to: '16:00' },
                sunday: actualData.workingHours.sunday || { isOpen: false, from: '10:00', to: '16:00' },
              });
            }
            
            if (actualData.photos) {
              setPhotos({
                logo: actualData.photos.logo || null,
                coverImage: actualData.photos.coverImage || null,
                galleryImages: actualData.photos.galleryImages || [],
              });
            }

            // Update store with the found business data
            setBusinessId(checkData.data.businessId);
            setBusinessName(actualData.info?.name || '');
            setIsBusinessSetup(true);
          }
        } else {
          // No business setup yet, continue with empty form for new business creation
        }
      } catch (error) {
        console.error('Error loading business data:', error);
        setError('Не удалось загрузить данные бизнеса');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadBusinessData();
  }, [setBusinessId, setBusinessName, setIsBusinessSetup]); // Add store setters as dependencies

  // Update submit function to handle both create and update
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const businessData = {
        info: businessInfo,
        address,
        services,
        workingHours,
        photos
      };

      const url = businessId ? `/api/business/${businessId}` : '/api/business/create';
      const method = businessId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${businessId ? 'update' : 'create'} business profile`);
      }

      const responseData = await response.json();
      
      // Update store with the new/updated business data
      const newBusinessId = responseData.businessId || responseData._id;
      if (newBusinessId) {
        setBusinessId(newBusinessId);
        setBusinessName(businessInfo.name);
        setIsBusinessSetup(true);
      }

      // Redirect to dashboard after successful creation/update
      router.push('/dashboard');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${businessId ? 'update' : 'create'} business profile`);
    } finally {
      setLoading(false);
    }
  };
  const nextStep = () => {
    switch (currentStep) {
      case 'info':
        if (validateBusinessInfo()) setCurrentStep('address');
        break;
      case 'address':
        if (validateAddress()) setCurrentStep('services');
        break;
      case 'services':
        if (validateServices()) setCurrentStep('hours');
        break;
      case 'hours':
        setCurrentStep('photos');
        break;
      case 'photos':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        handleSubmit();
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'address':
        setCurrentStep('info');
        break;
      case 'services':
        setCurrentStep('address');
        break;
      case 'hours':
        setCurrentStep('services');
        break;
      case 'photos':
        setCurrentStep('hours');
        break;
      case 'confirmation':
        setCurrentStep('photos');
        break;
    }
  };

  // Validation functions
  const validateBusinessInfo = () => {
    if (!businessInfo.name) {
      setError('Пожалуйста, укажите название бизнеса');
      return false;
    }
    if (!businessInfo.category) {
      setError('Пожалуйста, выберите категорию бизнеса');
      return false;
    }
    setError('');
    return true;
  };

  const validateAddress = () => {
    if (!address.street || !address.building) {
      setError('Пожалуйста, укажите полный адрес');
      return false;
    }
    setError('');
    return true;
  };

  const validateServices = () => {
    if (services.length === 0) {
      setError('Добавьте хотя бы одну услугу');
      return false;
    }
    
    for (const service of services) {
      if (!service.name || service.price <= 0) {
        setError('Укажите название и цену для всех услуг');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  // Form input handlers
  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index: number, field: string, value: string | number) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === 'price' || field === 'duration' ? Number(value) : value
    };
    setServices(updatedServices);
  };

  const addService = () => {
    setServices([
      ...services, 
      { 
        id: `service-${Date.now()}`, 
        name: '', 
        duration: 60, 
        price: 0, 
        description: '' 
      }
    ]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Render steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 'info':
        return renderBusinessInfoStep();
      case 'address':
        return renderAddressStep();
      case 'services':
        return renderServicesStep();
      case 'hours':
        return renderHoursStep();
      case 'photos':
        return renderPhotosStep();
      case 'confirmation':
        return renderConfirmationStep();
    }
  };

  const renderBusinessInfoStep = () => (
    <div className="space-y-6">
      <div>
        <Input
          label="Название бизнеса"
          name="name"
          value={businessInfo.name}
          onChange={handleBusinessInfoChange}
          placeholder="Например: Салон красоты 'Весна'"
          required
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Категория
        </label>
        <select
          name="category"
          value={businessInfo.category}
          onChange={handleBusinessInfoChange}
          className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
          required
        >
          <option value="">Выберите категорию</option>
          {BUSINESS_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Описание
        </label>
        <textarea
          name="description"
          value={businessInfo.description}
          onChange={handleBusinessInfoChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
          placeholder="Расскажите о своем бизнесе"
        />
      </div>

      <div>
        <Input
          label="Телефон"
          name="phone"
          type="tel"
          value={businessInfo.phone}
          onChange={handleBusinessInfoChange}
          placeholder="+7 (XXX) XXX-XX-XX"
          fullWidth
        />
      </div>

      <div>
        <Input
          label="Email для бизнеса"
          name="email"
          type="email"
          value={businessInfo.email}
          onChange={handleBusinessInfoChange}
          placeholder="business@example.com"
          fullWidth
        />
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-6">
      <div>
        <Input
          label="Улица"
          name="street"
          value={address.street}
          onChange={handleAddressChange}
          placeholder="Название улицы"
          required
          fullWidth
        />
      </div>

      <div>
        <Input
          label="Дом, корпус, квартира"
          name="building"
          value={address.building}
          onChange={handleAddressChange}
          placeholder="123, корп. 2"
          required
          fullWidth
        />
      </div>

      <div>
        <Input
          label="Город"
          name="city"
          value={address.city}
          onChange={handleAddressChange}
          disabled
          fullWidth
        />
      </div>

      <div>
        <Input
          label="Почтовый индекс"
          name="postalCode"
          value={address.postalCode}
          onChange={handleAddressChange}
          placeholder="060000"
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ориентир
        </label>
        <textarea
          name="landmark"
          value={address.landmark}
          onChange={handleAddressChange}
          rows={2}
          className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
          placeholder="Например: Напротив ТРЦ 'Атырау'"
        />
      </div>

      {/* Map placeholder - would integrate with Google Maps or similar */}
      <div className="mt-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Карта будет доступна в ближайшем обновлении
        </p>
      </div>
    </div>
  );

  const renderServicesStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700">Услуги</h3>
        <Button variant="secondary" onClick={addService} type="button">
          + Добавить услугу
        </Button>
      </div>

      {services.map((service, index) => (
        <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700">Услуга #{index + 1}</h4>
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Удалить
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Название услуги"
                value={service.name}
                onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                placeholder="Например: Мужская стрижка"
                required
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Цена (₸)"
                  type="number"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                  min="0"
                  required
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Длительность (мин)"
                  type="number"
                  value={service.duration}
                  onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                  min="5"
                  step="5"
                  required
                  fullWidth
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1">
              Описание услуги
            </label>
            <textarea
              value={service.description}
              onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
              rows={2}
              className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
              placeholder="Опишите услугу"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderHoursStep = () => {
    const days = [
      { id: 'monday', name: 'Понедельник' },
      { id: 'tuesday', name: 'Вторник' },
      { id: 'wednesday', name: 'Среда' },
      { id: 'thursday', name: 'Четверг' },
      { id: 'friday', name: 'Пятница' },
      { id: 'saturday', name: 'Суббота' },
      { id: 'sunday', name: 'Воскресенье' },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700">Рабочие часы</h3>
        
        {days.map(day => (
          <div key={day.id} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center w-full sm:w-1/3 mb-2 sm:mb-0">
              <input
                type="checkbox"
                id={`${day.id}-open`}
                checked={workingHours[day.id as keyof typeof workingHours].isOpen}
                onChange={(e) => handleWorkingHoursChange(day.id, 'isOpen', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`${day.id}-open`} className="ml-2 block text-sm text-gray-900 dark:text-gray-700">
                {day.name}
              </label>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-2/3">
              <select
                value={workingHours[day.id as keyof typeof workingHours].from}
                onChange={(e) => handleWorkingHoursChange(day.id, 'from', e.target.value)}
                disabled={!workingHours[day.id as keyof typeof workingHours].isOpen}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:text-gray-500 disabled:dark:text-gray-400"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                    {`${String(i).padStart(2, '0')}:00`}
                  </option>
                ))}
              </select>
              
              <span className="text-gray-500">до</span>
              
              <select
                value={workingHours[day.id as keyof typeof workingHours].to}
                onChange={(e) => handleWorkingHoursChange(day.id, 'to', e.target.value)}
                disabled={!workingHours[day.id as keyof typeof workingHours].isOpen}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:text-gray-500 disabled:dark:text-gray-400"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                    {`${String(i).padStart(2, '0')}:00`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPhotosStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-2">
          Логотип
        </label>
        <div className="mt-1 flex items-center">
          <div className="h-24 w-24 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex justify-center items-center overflow-hidden">
            <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <Button variant="secondary" type="button">Загрузить</Button>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG или JPG, квадратное изображение</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-2">
          Обложка
        </label>
        <div className="mt-1 flex items-center">
          <div className="h-32 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex justify-center items-center">
            <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="mt-2">
          <Button variant="secondary" type="button">Загрузить</Button>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG или JPG, рекомендуемый размер 1200×300px</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-2">
          Фотогалерея
        </label>
        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="relative h-24 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex justify-center items-center">
              <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Добавьте фотографии вашего бизнеса (до 8 фото)</p>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center pb-6">
        <svg className="mx-auto h-16 w-16 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-700">
          {businessId ? 'Готово к обновлению!' : 'Все готово!'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {businessId 
            ? 'Проверьте обновленную информацию ниже перед сохранением изменений'
            : 'Проверьте информацию ниже перед созданием профиля бизнеса'
          }
        </p>
      </div>

      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Название</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-700 col-span-2">{businessInfo.name}</dd>
          </div>

          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Категория</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-700 col-span-2">
              {BUSINESS_CATEGORIES.find(c => c.id === businessInfo.category)?.name || ''}
            </dd>
          </div>

          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Контакты</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-700 col-span-2">
              {businessInfo.phone && <div>{businessInfo.phone}</div>}
              {businessInfo.email && <div>{businessInfo.email}</div>}
            </dd>
          </div>

          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Адрес</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-700 col-span-2">
              {address.street}, {address.building}, {address.city}
            </dd>
          </div>

          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Услуги</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-700 col-span-2">
              <ul className="list-disc pl-5">
                {services.map(service => (
                  <li key={service.id}>{service.name} - {service.price} ₸ ({service.duration} мин)</li>
                ))}
              </ul>
            </dd>
          </div>

          <div className="py-3 grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Рабочие часы</dt>
            <dd className="text-sm text-gray-900 dark:text-gray-700 col-span-2">
              <ul className="space-y-1">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <li key={day}>
                    {day === 'monday' && 'Понедельник: '}
                    {day === 'tuesday' && 'Вторник: '}
                    {day === 'wednesday' && 'Среда: '}
                    {day === 'thursday' && 'Четверг: '}
                    {day === 'friday' && 'Пятница: '}
                    {day === 'saturday' && 'Суббота: '}
                    {day === 'sunday' && 'Воскресенье: '}
                    {hours.isOpen ? `${hours.from} - ${hours.to}` : 'Закрыто'}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  // Steps progress indicator
  const steps = [
    { id: 'info', name: 'Информация' },
    { id: 'address', name: 'Адрес' },
    { id: 'services', name: 'Услуги' },
    { id: 'hours', name: 'Рабочие часы' },
    { id: 'photos', name: 'Фото' },
    { id: 'confirmation', name: 'Подтверждение' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {businessId ? 'Редактирование бизнеса' : 'Настройка бизнеса'}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {businessId 
              ? 'Обновите информацию о вашем бизнесе'
              : 'Заполните информацию о вашем бизнесе, чтобы начать принимать клиентов'
            }
          </p>
        </div>

        {/* Loading state for data retrieval */}
        {isLoadingData ? (
          <Card className="overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-gray-600 dark:text-gray-400">Загрузка данных бизнеса...</span>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* No business notice */}
            {!businessId && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-700 dark:text-blue-400">
                  <strong>Создание нового бизнеса:</strong> Заполните все шаги для создания профиля вашего бизнеса.
                </p>
              </div>
            )}

            {/* Steps indicator */}
            <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center justify-between w-full">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8' : ''}`}>
                {stepIdx !== steps.length - 1 ? (
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                ) : null}
                <div
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    step.id === currentStep
                      ? 'bg-blue-600 text-white'
                      : steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                  }`}
                >
                  {steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id) ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span>{stepIdx + 1}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Step content */}
        <Card className="overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {renderStepContent()}

            <div className="mt-8 flex justify-between">
              <Button
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 'info' || loading}
              >
                Назад
              </Button>

              <Button
                variant="primary"
                onClick={nextStep}
                disabled={loading}
              >
                {currentStep === 'confirmation' ? (loading ? `${businessId ? 'Обновление' : 'Создание'}...` : `${businessId ? 'Обновить' : 'Создать'} профиль`) : 'Далее'}
              </Button>
            </div>
          </div>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}


