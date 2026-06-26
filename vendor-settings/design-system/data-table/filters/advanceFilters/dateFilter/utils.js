export const today = new Date();
export const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
export const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);
export const last14Days = new Date(today);
last14Days.setDate(today.getDate() - 14);
export const last30Days = new Date(today);
last30Days.setDate(today.getDate() - 30);
export const last90Days = new Date(today);
last90Days.setDate(today.getDate() - 90);

export const displayDateFormat = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

export const formattedDate = (date) => {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let day = String(date.getDate()).padStart(2, '0');
  let newDate = `${year}-${month}-${day}`;
  return newDate;
};
