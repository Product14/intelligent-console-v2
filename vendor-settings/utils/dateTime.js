// input: 1757574259375
export function convertTimestamp({
  timestamp,
  dateFormat = 'en-US',
  timeFormat = 'en-US',
  dateOptions = { year: 'numeric', month: 'long', day: '2-digit' },
  timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  },
}) {
  if (!timestamp) return { date: '', time: '' };
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp');
    }
    const formattedDate = new Intl.DateTimeFormat(
      dateFormat,
      dateOptions
    ).format(date);
    const formattedTime = new Intl.DateTimeFormat(
      timeFormat,
      timeOptions
    ).format(date);
    return { date: formattedDate, time: formattedTime };
  } catch (error) {
    console.error('Invalid timestamp(', timestamp, ') provided', error);
    return {
      date: '',
      time: '',
    };
  }
}

// input: 2025-09-11T10:24:19.375Z
export function formatDate(dateInput) {
  const targetDate = new Date(dateInput);
  if (isNaN(targetDate.getTime())) {
    return 'Invalid Date';
  }
  return targetDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// input: 2025-09-11T10:24:19.375Z
export function dateFormat(dateString) {
  const date = new Date(dateString);
  // Format: 11 September 2025, 12:34 pm (no "at")
  const datePart = date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}
