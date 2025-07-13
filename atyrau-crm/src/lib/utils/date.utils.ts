/**
 * Enhanced date utility functions for working with calendar, appointments, and time formatting
 */

/**
 * Get an array of dates representing a month
 * Includes some days from previous and next months to fill the calendar grid
 */
export function getCalendarMonth(year: number, month: number): Date[] {
  const result: Date[] = [];

  // First day of the month
  const firstDay = new Date(year, month, 1);

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();

  // Calculate the number of days to include from the previous month
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;

  // Add days from previous month
  for (let i = daysFromPrevMonth; i > 0; i--) {
    const date = new Date(year, month, 1 - i);
    result.push(date);
  }

  // Add all days in the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    result.push(date);
  }

  // Calculate how many days we need from the next month to complete the grid
  const remainingDays = 42 - result.length;

  // Add days from next month
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    result.push(date);
  }

  return result;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(
  date: Date,
  currentMonth: number,
  currentYear: number
): boolean {
  return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
}

/**
 * Format a date as a localized string (e.g., "15 июля 2025")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a date as a short localized string (e.g., "15.07.2025")
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

/**
 * Format time as HH:MM string
 */
export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Format a date string to time display (HH:MM)
 * Unified function to replace duplicated formatTimeDisplay functions
 */
export function formatTimeDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format a date string to datetime display (DD.MM.YYYY HH:MM)
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${formatDateShort(date)} ${formatTimeDisplay(dateString)}`;
}

/**
 * Calculate end time based on start time and duration in minutes
 */
export function calculateEndTime(
  startTime: string,
  durationMinutes: number
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startTotalMinutes = hours * 60 + minutes;
  const endTotalMinutes = startTotalMinutes + durationMinutes;

  const endHours = Math.floor(endTotalMinutes / 60);
  const endMinutes = endTotalMinutes % 60;

  return formatTime(endHours, endMinutes);
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
}

/**
 * Get the start of the day for a given date
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the day for a given date
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get available time slots for a given date
 */
export function generateTimeSlots(
  date: Date,
  startHour: number = 8,
  endHour: number = 20,
  intervalMinutes: number = 15
): Array<{ time: string; date: Date; hour: number; minutes: number }> {
  const slots: Array<{
    time: string;
    date: Date;
    hour: number;
    minutes: number;
  }> = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      const slotTime = formatTime(hour, minutes);
      const slotDate = new Date(date);
      slotDate.setHours(hour, minutes, 0, 0);

      slots.push({
        time: slotTime,
        date: slotDate,
        hour,
        minutes,
      });
    }
  }

  return slots;
}

/**
 * Parse date-time local format to Date object
 */
export function parseDateTimeLocal(dateTimeString: string): Date {
  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute);
}

/**
 * Format Date object to datetime-local format (YYYY-MM-DDTHH:MM)
 */
export function formatToDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}
