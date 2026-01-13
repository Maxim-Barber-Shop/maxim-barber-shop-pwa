// Italian day and month names for localization
const ITALIAN_DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const ITALIAN_MONTHS_SHORT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const ITALIAN_DAYS_FULL = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];

export interface FormattedDate {
  day: string;
  date: number;
  month: string;
}

export interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
}

/**
 * Generate an array of dates starting from today
 * @param days Number of days to generate (default: 35 for 5 weeks)
 */
export function generateDates(days: number = 35): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/**
 * Format a date into Italian day/date/month parts
 */
export function formatDateItalian(date: Date): FormattedDate {
  return {
    day: ITALIAN_DAYS_SHORT[date.getDay()],
    date: date.getDate(),
    month: ITALIAN_MONTHS_SHORT[date.getMonth()],
  };
}

/**
 * Get available time slots for a specific date
 */
export function getAvailableTimeSlots(date: Date, availability: AvailabilitySlot[]): string[] {
  const dateStr = date.toISOString().split('T')[0];
  return availability
    .filter((slot) => slot.date === dateStr)
    .map((slot) => slot.time)
    .filter((time, index, self) => self.indexOf(time) === index)
    .sort();
}

/**
 * Check if a time slot is unavailable
 */
export function isSlotUnavailable(date: Date, time: string, availability: AvailabilitySlot[]): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const slot = availability.find((s) => s.date === dateStr && s.time === time);
  return slot ? !slot.available : true;
}

/**
 * Get full day name in Italian
 */
export function getDayNameItalian(dayOfWeek: number): string {
  return ITALIAN_DAYS_FULL[dayOfWeek];
}

/**
 * Get short day name in Italian
 */
export function getShortDayNameItalian(dayOfWeek: number): string {
  return ITALIAN_DAYS_SHORT[dayOfWeek];
}

/**
 * Get short month name in Italian
 */
export function getShortMonthNameItalian(month: number): string {
  return ITALIAN_MONTHS_SHORT[month];
}
