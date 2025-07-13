'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/utils/date-utils';

interface TimeSlot {
  time: string;
  timestamp: number;
  available: boolean;
}

interface TimeSlotsProps {
  date: Date;
  onSelectSlot: (timestamp: number) => void;
  selectedSlot?: number;
  businessHours?: any;
  serviceDuration?: number;
  className?: string;
}

export function TimeSlots({ 
  date, 
  onSelectSlot,
  selectedSlot,
  businessHours,
  serviceDuration = 60,
  className = ''
}: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        // Format the date as ISO string
        const formattedDate = date.toISOString().split('T')[0];
        
        // Fetch available time slots from API
        const response = await fetch(`/api/appointments/available-slots?date=${formattedDate}&duration=${serviceDuration}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch available time slots');
        }
        
        const data = await response.json();
        setTimeSlots(data.slots);
      } catch ($1: unknown) {
        setError(err.message);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (date) {
      fetchTimeSlots();
    }
  }, [date, serviceDuration]);
  
  // Group time slots by hour for better UI organization
  const groupedSlots: { [hour: string]: TimeSlot[] } = {};
  
  timeSlots.forEach(slot => {
    const hour = slot.time.split(':')[0];
    if (!groupedSlots[hour]) {
      groupedSlots[hour] = [];
    }
    groupedSlots[hour].push(slot);
  });
  
  const groupHours = Object.keys(groupedSlots).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Доступное время
      </h2>
      
      {loading && (
        <div className="py-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка доступных слотов...</p>
        </div>
      )}
      
      {error && (
        <div className="py-6 text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => setLoading(true)} // This will trigger the useEffect
            className="mt-2 text-blue-600 dark:text-blue-400 underline"
          >
            Попробовать снова
          </button>
        </div>
      )}
      
      {!loading && !error && timeSlots.length === 0 && (
        <div className="py-6 text-center text-gray-600 dark:text-gray-400">
          <p>На выбранную дату нет доступного времени</p>
        </div>
      )}
      
      {!loading && !error && timeSlots.length > 0 && (
        <div className="space-y-6">
          {groupHours.map(hour => (
            <div key={hour} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">{hour}:00</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {groupedSlots[hour].map(slot => (
                  <button
                    key={slot.timestamp}
                    onClick={() => slot.available && onSelectSlot(slot.timestamp)}
                    disabled={!slot.available}
                    className={`
                      px-2 py-1 text-sm rounded-md text-center
                      ${slot.available 
                        ? selectedSlot === slot.timestamp
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      }
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

