/**
 * Utility functions for handling local dates without UTC timezone shift.
 */

/**
 * Returns a date formatted as 'YYYY-MM-DD' using local timezone (not UTC).
 * Avoids date offset issues caused by Date.toISOString() in UTC-3 (Argentina).
 */
export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string ('YYYY-MM-DD' or ISO string) to display format 'DD-MM-YYYY'
 */
export const formatDisplayDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return dateStr;
};
