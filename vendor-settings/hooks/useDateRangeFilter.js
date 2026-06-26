import React from 'react';

const useDateRangeFilter = ({ end, daysAgo }) => {
  if (!daysAgo) {
    return null;
  }

  function getEpochTime(date) {
    return Math.floor(date.getTime() / 1000);
  }

  const endDate = new Date(end);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - daysAgo);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    start_date: getEpochTime(startDate),
    end_date: getEpochTime(endDate),
  };
};

export default useDateRangeFilter;
