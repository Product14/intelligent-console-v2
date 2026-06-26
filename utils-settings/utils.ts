export const truncateMessage = (message: string, maxWords = 6) => {
  if (!message) return '';
  const words = message.trim().split(/\s+/);
  if (words.length <= maxWords) return message;
  return words.slice(0, maxWords).join(' ') + '...';
};

export const getRandomBgColor = (name: string) => {
  // Array of lighter, pleasant background colors from tailwind config
  const colors = [
    '#3A89FF', // light blue
    '#00B640', // light green
    '#FFA03A', // light orange
    '#FF739D', // light pink (pinkGradient)
    '#8D4EF3', // light purple
    '#4A3AFF', // bright blue
    '#2DDFF8', // light cyan
    '#F4C162', // warning yellow
    '#6B33F5', // website primary
    '#87C4F3', // very light blue
    '#93A8EF', // soft blue
    '#C7A8EA', // soft purple
  ];

  // Use name as seed for consistent color per person
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Text utilities
export const normalizeNewlines = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\/n/g, '\n');
};

export const splitToPoints = (value: string) => {
  if (!value) return [] as string[];
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

export const truncateWordsPreserveNewlines = (
  text: string,
  maxWords: number
) => {
  if (!text) return '';
  const lines = text.split('\n');
  const resultLines: string[] = [];
  let remaining = maxWords;
  let truncated = false;

  for (const line of lines) {
    if (remaining <= 0) {
      truncated = true;
      break;
    }
    const lineWords = line.trim().length > 0 ? line.trim().split(/\s+/) : [];
    if (lineWords.length === 0) {
      resultLines.push('');
      continue;
    }
    const take = Math.min(remaining, lineWords.length);
    resultLines.push(lineWords.slice(0, take).join(' '));
    if (take < lineWords.length) truncated = true;
    remaining -= take;
  }

  const result = resultLines.join('\n');
  return truncated ? result + '…' : result;
};

// Timestamp formatter for timeline cards (Month D, YYYY + 12-hour time)
export const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return {
    date: `${month} ${day}, ${year}`,
    time: `${displayHours}:${displayMinutes} ${ampm}`,
  };
};

// Long date: 20 July, 2025
export const formatLongDate = (isoString?: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const day = date.getDate();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

// Utility function to format text values properly
export const formatTextValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') {
    if (value.trim() === '' || value.trim().toLowerCase() === 'null')
      return '-';
    // Convert to proper case - capitalize first letter of each word
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return String(value);
};
