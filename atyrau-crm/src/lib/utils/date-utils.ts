/**
 * Date utility functions for working with calendar and appointments
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
  // If firstDayOfWeek is 0 (Sunday), we need 0 days from previous month
  // If firstDayOfWeek is 1 (Monday), we need 1 days from previous month, etc.
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
  // We want to fill 6 rows of 7 days (42 days total)
  const remainingDays = 42 - result.length;

  // Add days from next month
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    result.push(date);
  }

  return result;
}

/**
 * Get week days localized to Russian
 */
export function getWeekDaysRu(short: boolean = false): string[] {
  if (short) {
    return ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  }

  return [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
}

/**
 * Get month names localized to Russian
 */
export function getMonthNamesRu(short: boolean = false): string[] {
  if (short) {
    return [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ];
  }

  return [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
}

/**
 * Format a date to a string (DD.MM.YYYY)
 */
export function formatDate(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${date.getFullYear()}`;
}

/**
 * Format time to a string (HH:MM)
 */
export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Check if two dates are the same day (ignoring time)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if the date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if the date is in the past
 */
export function isPastDay(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date = new Date(date);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Generate time slots for a given date and business working hours
 */
export function generateTimeSlots(
  date: Date,
  businessHours: any,
  serviceDuration: number = 60,
  bookedSlots: { start: Date; end: Date }[] = []
): { time: string; timestamp: number; available: boolean }[] {
  const dayOfWeek = date.getDay();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[dayOfWeek];

  // If the business is closed on this day, return empty array
  if (!businessHours[dayName]?.isOpen) {
    return [];
  }

  const slots: { time: string; timestamp: number; available: boolean }[] = [];
  const fromTime = businessHours[dayName].from;
  const toTime = businessHours[dayName].to;

  // Parse from and to times
  const [fromHour, fromMinute] = fromTime.split(":").map(Number);
  const [toHour, toMinute] = toTime.split(":").map(Number);

  // Create time slots
  const slotDuration = serviceDuration || 60; // Default to 60 minutes if not provided
  const slotIntervals = slotDuration / 15; // Each slot is 15 minutes

  // Start time in minutes since midnight
  let currentMinutes = fromHour * 60 + fromMinute;

  // End time in minutes since midnight
  const endMinutes = toHour * 60 + toMinute;

  // Create 15-minute intervals until end time
  while (currentMinutes + slotDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;

    const slotTime = formatTime(hours, minutes);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);

    // Check if this slot overlaps with any booked slots
    const slotEndDate = new Date(slotDate);
    slotEndDate.setMinutes(slotEndDate.getMinutes() + slotDuration);

    // A slot is unavailable if it has already passed or overlaps with a booked slot
    const isPast = slotDate < new Date();
    const isOverlapping = bookedSlots.some((bookedSlot) => {
      return (
        (slotDate >= bookedSlot.start && slotDate < bookedSlot.end) ||
        (slotEndDate > bookedSlot.start && slotEndDate <= bookedSlot.end) ||
        (slotDate <= bookedSlot.start && slotEndDate >= bookedSlot.end)
      );
    });

    const available = !isPast && !isOverlapping;

    slots.push({
      time: slotTime,
      timestamp: slotDate.getTime(),
      available,
    });

    // Move to the next slot
    currentMinutes += 15; // 15-minute intervals
  }

  return slots;
}

