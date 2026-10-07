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
 * Formats a date string ('YYYY-MM-DD' or ISO string) to display format 'DD/MM/YYYY' (Argentine standard)
 */
export const formatDisplayDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

/**
 * Formats a date string to 'DD/MM/YYYY HH:mm'
 */
export const formatDisplayDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const datePart = formatDisplayDate(dateStr);
  const timePart = dateStr.includes(' ')
    ? dateStr.split(' ')[1]
    : dateStr.includes('T')
    ? dateStr.split('T')[1]
    : null;

  if (timePart) {
    const [hours, minutes] = timePart.split(':');
    if (hours !== undefined && minutes !== undefined) {
      return `${datePart} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
  }
  return datePart;
};
