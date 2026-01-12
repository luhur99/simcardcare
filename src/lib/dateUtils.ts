/**
 * Date utility functions for UTC+7 (WIB - Waktu Indonesia Barat) timezone
 */

/**
 * Get current date in UTC+7 timezone as ISO string (YYYY-MM-DD)
 */
export function getTodayWIB(): string {
  const now = new Date();
  // Convert to UTC+7 by adding 7 hours (in milliseconds)
  const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return wibTime.toISOString().split("T")[0];
}

/**
 * Get current datetime in UTC+7 timezone as ISO string
 */
export function getNowWIB(): string {
  const now = new Date();
  // Convert to UTC+7
  const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return wibTime.toISOString();
}

/**
 * Convert any date to WIB timezone start of day (00:00:00 WIB)
 */
export function toWIBStartOfDay(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  const wibOffset = 7 * 60; // UTC+7 in minutes
  const localOffset = d.getTimezoneOffset(); // User's timezone offset
  const totalOffset = wibOffset + localOffset;
  
  const wibDate = new Date(d.getTime() + (totalOffset * 60 * 1000));
  wibDate.setHours(0, 0, 0, 0);
  
  return wibDate;
}

/**
 * Convert any date to WIB timezone end of day (23:59:59 WIB)
 */
export function toWIBEndOfDay(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  const wibOffset = 7 * 60; // UTC+7 in minutes
  const localOffset = d.getTimezoneOffset(); // User's timezone offset
  const totalOffset = wibOffset + localOffset;
  
  const wibDate = new Date(d.getTime() + (totalOffset * 60 * 1000));
  wibDate.setHours(23, 59, 59, 999);
  
  return wibDate;
}

/**
 * Create Date object from YYYY-MM-DD string in WIB timezone
 */
export function createWIBDate(dateString: string): Date {
  // Parse as YYYY-MM-DD and treat as WIB midnight
  const [year, month, day] = dateString.split("-").map(Number);
  
  // Create date in UTC
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  
  // Adjust for WIB (subtract 7 hours to get WIB midnight in UTC)
  const wibDate = new Date(utcDate.getTime() - (7 * 60 * 60 * 1000));
  
  return wibDate;
}

/**
 * Format date for display in Indonesian locale (WIB timezone)
 */
export function formatDateWIB(date: Date | string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta", // WIB timezone
    ...options
  };
  
  return d.toLocaleDateString("id-ID", defaultOptions);
}

/**
 * Format datetime for display in Indonesian locale (WIB timezone)
 */
export function formatDateTimeWIB(date: Date | string | null): string {
  if (!date) return "-";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta", // WIB timezone
    hour12: false
  });
}

/**
 * Calculate days between two dates (considering WIB timezone)
 */
export function calculateDaysWIB(startDate: string | Date, endDate: string | Date = new Date()): number {
  const start = typeof startDate === "string" ? createWIBDate(startDate) : startDate;
  const end = typeof endDate === "string" ? createWIBDate(endDate.toISOString().split("T")[0]) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get first day of month in WIB timezone
 */
export function getFirstDayOfMonthWIB(year: number, month: number): Date {
  // Create first day of month in UTC
  const utcDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  // Adjust for WIB
  return new Date(utcDate.getTime() - (7 * 60 * 60 * 1000));
}

/**
 * Get last day of month in WIB timezone
 */
export function getLastDayOfMonthWIB(year: number, month: number): Date {
  // Create first day of next month, then subtract 1 day
  const utcDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  // Adjust for WIB
  return new Date(utcDate.getTime() - (7 * 60 * 60 * 1000));
}

/**
 * Get current month range in WIB timezone
 */
export function getCurrentMonthRangeWIB(): { start: string; end: string } {
  const now = new Date();
  const wibNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  const year = wibNow.getUTCFullYear();
  const month = wibNow.getUTCMonth();
  
  const start = getFirstDayOfMonthWIB(year, month);
  const end = getLastDayOfMonthWIB(year, month);
  
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0]
  };
}

/**
 * Get N months back range in WIB timezone (for charts)
 */
export function getMonthsBackRangeWIB(monthsBack: number): { start: string; end: string } {
  const now = new Date();
  const wibNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  const currentYear = wibNow.getUTCFullYear();
  const currentMonth = wibNow.getUTCMonth();
  
  // Calculate start date (N months back)
  const startYear = currentMonth - monthsBack < 0 
    ? currentYear - 1 
    : currentYear;
  const startMonth = currentMonth - monthsBack < 0 
    ? 12 + (currentMonth - monthsBack)
    : currentMonth - monthsBack;
  
  const start = getFirstDayOfMonthWIB(startYear, startMonth);
  const end = getLastDayOfMonthWIB(currentYear, currentMonth);
  
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0]
  };
}