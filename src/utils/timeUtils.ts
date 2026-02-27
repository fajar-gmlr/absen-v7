/**
 * Time-gated logic for attendance submission
 * Based on PRD Section 3.1
 */

export type TimeGateResult = {
  allowed: boolean;
  status: 'blocked' | 'normal' | 'late';
  message: string;
};

export function checkTimeGate(): TimeGateResult {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes; // Convert to minutes for easier comparison

  // 05:00 AM in minutes = 5 * 60 = 300
  // 10:00 AM in minutes = 10 * 60 = 600
  const START_TIME = 5 * 60;   // 05:00 AM
  const LATE_TIME = 10 * 60;   // 10:00 AM

  if (currentTime < START_TIME) {
    return {
      allowed: false,
      status: 'blocked',
      message: 'Belum waktunya absen 🤨, tunggu setelah jam 05:00 sampai 10:00',
    };
  }

  if (currentTime >= START_TIME && currentTime < LATE_TIME) {
    return {
      allowed: true,
      status: 'normal',
      message: 'Berhasil Absen. Jangan Lupa untuk Absen hari berikutnya ☺️',
    };
  }

  // After 10:00 AM - late submission
  return {
    allowed: true,
    status: 'late',
    message: 'Telat absen hari ini 🤨',
  };
}

/**
 * Get current timestamp in ISO format
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if MCU date is 11 months old (for alarm)
 */
export function isMCUExpired(mcuDate: string): boolean {
  const mcu = new Date(mcuDate);
  const now = new Date();
  const diffMonths = (now.getTime() - mcu.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return diffMonths >= 11;
}

/**
 * Expand multi-day holidays into individual date strings
 * Supports both single dates (string) and multi-day holidays (object with date and endDate)
 */
export function expandHolidaysToDates(holidays: (string | { date: string; endDate?: string })[]): string[] {
  const expandedDates: string[] = [];
  
  for (const holiday of holidays) {
    if (typeof holiday === 'string') {
      // Single day holiday (backward compatibility)
      expandedDates.push(holiday);
    } else if (holiday.endDate) {
      // Multi-day holiday - expand to all dates in range
      const start = new Date(holiday.date);
      const end = new Date(holiday.endDate);
      const current = new Date(start);
      
      while (current <= end) {
        expandedDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Single day holiday (new format)
      expandedDates.push(holiday.date);
    }
  }
  
  return expandedDates;
}

/**
 * Calculate business days between two dates (excluding weekends and holidays)
 * Now supports multi-day holidays
 */
export function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  holidays: (string | { date: string; endDate?: string })[] = []
): number {
  // Expand multi-day holidays to individual dates
  const expandedHolidays = expandHolidaysToDates(holidays);
  
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dateString = current.toISOString().split('T')[0];
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !expandedHolidays.includes(dateString)) {
      count++;
    }
    
    current.setDate(current.getDate() + 1);
  }

  return count;
}
