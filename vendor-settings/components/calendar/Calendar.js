import React, { useEffect, useState } from 'react';

import Image from 'next/image';

// import { allIcons } from "@/lib/icon";

function Calendar({ selectedDate, setSelectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const today = new Date();

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      daysArray.push(i);
    }
    setDays(daysArray);
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return date < today && !isToday(day);
  };

  const handleDateClick = (day) => {
    if (!isPastDate(day)) {
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      setSelectedDate(newDate);
    }
  };

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="mx-auto w-full text-center">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <span className="text-base font-semibold text-black/80">
          {currentDate.toLocaleString('default', { month: 'long' })}{' '}
          {currentDate.getFullYear()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="rounded-full bg-[#f1f1f1] p-2 text-xl md:p-3"
          >
            <Image
              src={
                'https://spyne-static.s3.us-east-1.amazonaws.com/landing-pages/landing-video/arrowleft.svg'
              }
              alt="left arrow"
              width={10}
              height={10}
              className="h-3 w-3 md:h-4 md:w-4"
            />
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-full bg-[#f1f1f1] p-2 text-xl md:p-3"
          >
            <Image
              src={
                'https://spyne-static.s3.us-east-1.amazonaws.com/landing-pages/landing-video/arrowleft.svg'
              }
              alt="right arrow"
              width={10}
              height={10}
              className="h-3 w-3 rotate-180 md:h-4 md:w-4"
            />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="mb-2 text-center text-xs font-medium text-black/20 md:mb-5"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex aspect-square cursor-pointer items-center justify-center rounded-full text-base font-semibold ${
              day
                ? selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentDate.getMonth() &&
                  selectedDate.getFullYear() === currentDate.getFullYear()
                  ? 'bg-blue-light text-white'
                  : isPastDate(day)
                    ? 'pointer-events-none bg-[#f8f8f8] text-black/70'
                    : 'bg-[#F2EDFE]'
                : 'pointer-events-none text-gray-400'
            }`}
            onClick={() => handleDateClick(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
