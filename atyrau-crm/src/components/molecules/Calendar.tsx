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
    
    let classes = 'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors';
    
    // Base styles based on month and disabled state
    if (!isCurrentMonth) {
      classes += ' text-text-light';
    } else if (isDisabled) {
      classes += ' text-disabled-text cursor-not-allowed';
    } else {
      classes += ' hover:bg-table-row-hover cursor-pointer text-text';
    }
    
    // Today indicator
    if (isToday(date)) {
      classes += ' border-2 border-primary';
    }
    
    // Selected state
    if (isSelected) {
      classes += ' bg-primary text-white hover:bg-primary-hover';
    }
    
    // Highlight states
    if (highlightType && !isDisabled && !isSelected) {
      switch (highlightType) {
        case 'busy':
          classes += ' bg-error/10 text-error border border-error/20';
          break;
        case 'available':
          classes += ' bg-success/10 text-success border border-success/20';
          break;
        case 'custom':
          classes += ' bg-warning/10 text-warning border border-warning/20';
          break;
      }
    }
    
    return classes;
  };
  
  return (
    <div className={`bg-content-bg border border-card-border rounded-lg shadow-card p-6 ${className}`}>
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-heading-secondary">
            {monthNames[viewDate.month]} {viewDate.year}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-hover-bg transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
          >
            Сегодня
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-hover-bg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm font-semibold text-table-header-text py-2">
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
        <div className="mt-6 pt-4 border-t border-card-border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <p className="text-sm text-text-muted">
              Выбрано: <span className="font-semibold text-text">{formatDate(selectedDate)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

