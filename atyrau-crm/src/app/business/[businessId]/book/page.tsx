'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/molecules/Calendar';
import { TimeSlots } from '@/components/molecules/TimeSlots';
import { formatDate } from '@/lib/utils/date-utils';

interface BookingPageProps {
  params: {
    businessId: string;
  };
}

interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface TimeSlot {
  time: string;
  timestamp: number;
  available: boolean;
}

export default function BookingPage({ params }: BookingPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [serviceDuration, setServiceDuration] = useState<number>(60);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Fetch business services when component mounts
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch(`/api/business/${params.businessId}/public/services`);
        const data = await response.json();
        
        // Handle the API response structure
        if (data.success && data.data) {
          setServices(data.data || []);
        } else {
          console.error('Failed to fetch services:', data.error);
          setServices([]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      }
    }
    
    fetchServices();
  }, [params.businessId]);

  const fetchAvailableTimeSlots = useCallback(async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const duration = serviceDuration || 60;
      
      const response = await fetch(
        `/api/appointments/available-slots?businessId=${params.businessId}&date=${dateString}&duration=${duration}`
      );
      
      const data = await response.json();
      setAvailableTimeSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, serviceDuration, params.businessId]);

  // Fetch available time slots when date or service changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate, selectedService, fetchAvailableTimeSlots]);

  function handleServiceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    
    if (serviceId) {
      const service = services.find(s => s._id === serviceId);
      if (service) {
        setServiceDuration(service.duration);
      }
    } else {
      setServiceDuration(60);
    }
  }

  function handleClientInfoChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleBooking() {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select a date and time');
      return;
    }
    
    if (!clientInfo.name || !clientInfo.phone) {
      alert('Please provide your name and phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Calculate end time based on service duration
      const startTime = new Date(selectedTimeSlot);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + serviceDuration);
      
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: params.businessId,
          serviceId: selectedService || undefined,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          clientName: clientInfo.name,
          clientPhone: clientInfo.phone,
          clientEmail: clientInfo.email,
          notes: clientInfo.notes
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Appointment booked successfully!');
        // Reset form
        setSelectedDate(undefined);
        setSelectedTimeSlot(undefined);
        setClientInfo({
          name: '',
          phone: '',
          email: '',
          notes: ''
        });
      } else {
        alert(`Booking failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Book an Appointment</h1>
      
      <div className="space-y-6">
        {/* Service Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedService}
            onChange={handleServiceChange}
          >
            <option value="">Select a service...</option>
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name} - {service.duration} min - ${service.price}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
          <Calendar onSelectDate={setSelectedDate} selectedDate={selectedDate} />
        </div>
        
        {/* Time Slot Selection */}
        {selectedDate && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Select a Time Slot for {formatDate(selectedDate)}
            </h2>
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : availableTimeSlots.length > 0 ? (
              <TimeSlots
                date={selectedDate}
                selectedSlot={selectedTimeSlot}
                onSelectSlot={setSelectedTimeSlot}
              />
            ) : (
              <p className="text-center text-gray-500">No available time slots for this date.</p>
            )}
          </div>
        )}
        
        {/* Client Information */}
        {selectedTimeSlot && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={clientInfo.name}
                  onChange={handleClientInfoChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={clientInfo.phone}
                  onChange={handleClientInfoChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={clientInfo.email}
                  onChange={handleClientInfoChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={clientInfo.notes}
                  onChange={handleClientInfoChange}
                  rows={3}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Booking Button */}
        {selectedTimeSlot && (
          <div className="flex justify-center">
            <button
              onClick={handleBooking}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
