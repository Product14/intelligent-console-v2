/**
 * Parses date strings in multiple formats
 * Supports:
 * - YYYY-MM-DD (e.g., "2025-06-30")
 * - DD-MM-YYYY (e.g., "30-10-2025")
 * @param dateString - Date string in various formats
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  // Try YYYY-MM-DD format first (ISO format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }

  // Try DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    // Month is 0-indexed in Date constructor
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Fallback to default Date parsing
  return new Date(dateString);
}

/**
 * Formats a date string consistently
 * Handles multiple input formats and returns a formatted string
 * @param dateString - Date string in various formats
 * @returns Formatted date string (e.g., "Jun 30, 2025")
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseDate(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    // If parsing fails, return the original string
    return dateString;
  }
}
