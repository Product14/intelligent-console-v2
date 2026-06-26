export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A';
  const dateObj = new Date(date);

  // Format date as "3rd Aug 2025"
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();

  const ordinalDay = day;
  const formattedDate = `${ordinalDay} ${month} ${year}`;

  if (includeTime) {
    // Format time as "13:57" (24-hour format)
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${formattedDate} ${hours}:${minutes}`;
  }

  return formattedDate;
};
