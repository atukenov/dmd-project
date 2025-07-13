'use client';

import { useState } from 'react';
import { 
  getCalendarMonth, 
  getMonthNamesRu, 
  getWeekDaysRu,
  isToday,
  isPastDay,
  isSameDay,
  formatDate
} from '@/lib/utils/date-utils';

interface CalendarProps {
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  disablePastDates?: boolean;
  disableDates?: Date[];
  highlightDates?: { date: Date; type: 'busy' | 'available' | 'custom' }[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function Calendar({ 
  onSelectDate, 
  selectedDate, 
  disablePastDates = true,
  disableDates = [],
  highlightDates = [],
  minDate,
  maxDate,
  className = ''
}: CalendarProps) {
  const today = new Date();
  
  // Current view state (month & year)
  const [viewDate, setViewDate] = useState({
    month: selectedDate ? selectedDate.getMonth() : today.getMonth(),
    year: selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  });
  
  // Calendar data
  const daysInMonth = getCalendarMonth(viewDate.year, viewDate.month);
  const weekDays = getWeekDaysRu(true);
  const monthNames = getMonthNamesRu();
  
  // Navigation handlers
  const goToPreviousMonth = () => {
    setViewDate(prev => {
      const prevMonth = prev.month - 1;
      if (prevMonth < 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prevMonth };
    });
  };
  
  const goToNextMonth = () => {
    setViewDate(prev => {
      const nextMonth = prev.month + 1;
      if (nextMonth > 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: nextMonth };
    });
  };
  
  const goToToday = () => {
    setViewDate({
      month: today.getMonth(),
      year: today.getFullYear()
    });
  };
  
  // Check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Check if date is in the past and past dates are disabled
    if (disablePastDates && isPastDay(date)) {
      return true;
    }
    
    // Check if date is in the disableDates array
    if (disableDates.some(disableDate => isSameDay(disableDate, date))) {
      return true;
    }
    
    // Check if date is before minDate
    if (minDate && date < minDate) {
      return true;
    }
    
    // Check if date is after maxDate
    if (maxDate && date > maxDate) {
      return true;
    }
    
    return false;
  };
  
  // Find highlight type for a date
  const getHighlightType = (date: Date) => {
    const highlight = highlightDates.find(h => isSameDay(h.date, date));
    return highlight?.type || null;
  };
  
  // Handler for date selection
  const handleSelectDate = (date: Date) => {
    if (!isDateDisabled(date)) {
      onSelectDate(date);
    }
  };
  
  // Get CSS classes for a calendar day
  const getDayClasses = (date: Date) => {
    const isDisabled = isDateDisabled(date);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isCurrentMonth = date.getMonth() === viewDate.month;
    const highlightType = getHighlightType(date);
    
    let classes = 'flex items-center justify-center w-10 h-10 rounded-full';
    
    // Base styles based on month and disabled state
    if (!isCurrentMonth) {
      classes += ' text-gray-400 dark:text-gray-600';
    } else if (isDisabled) {
      classes += ' text-gray-400 dark:text-gray-600 cursor-not-allowed';
    } else {
      classes += ' hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer';
    }
    
    // Today indicator
    if (isToday(date)) {
      classes += ' border border-blue-500 dark:border-blue-400';
    }
    
    // Selected state
    if (isSelected) {
      classes += ' bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500';
    }
    
    // Highlight states
    if (highlightType && !isDisabled && !isSelected) {
      switch (highlightType) {
        case 'busy':
          classes += ' bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
          break;
        case 'available':
          classes += ' bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
          break;
        case 'custom':
          classes += ' bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
          break;
      }
    }
    
    return classes;
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[viewDate.month]} {viewDate.year}
          </h2>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="p-2 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Сегодня
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => (
          <div
            key={index}
            className="text-center py-1"
            onClick={() => handleSelectDate(date)}
          >
            <div className={getDayClasses(date)}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Selected date display */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Выбрано: <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedDate)}</span>
          </p>
        </div>
      )}
    </div>
  );
}

