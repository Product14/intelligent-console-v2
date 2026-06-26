import React, { useState } from 'react';

import Image from 'next/image';

import SVG from '../svg/SVG';
import Calendar from './Calendar';

export default function DateAndTimeSelect({
  selectedDate,
  setSelectedDate,
  selectedTimezone,
  setSelectedTimezone,
  LandingVideoConfig,
  timezones,
  formattedDate,
  dayOfWeek,
  timeSlots,
  setShowMeetingModal,
  setSelectedTimeSlot,
  showTimeSelection,
  setShowTimeSelection,
  handleSubmit,
}) {
  const handleMobileDateSelect = () => {
    setShowTimeSelection(true);
  };

  return (
    <div>
      {/* Mobile View (less than 768px) */}
      <div className="hidden max-md:block">
        {!showTimeSelection ? (
          // Date selection screen
          <div>
            <p className="text-blue text-lg font-semibold">
              {LandingVideoConfig?.meeting_txt?.right_txt1}
            </p>
            <div className="mb-5 mt-4 md:mt-6">
              <Calendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
            <div className="mb-5">
              <div className="text-blue text-lg font-semibold">
                {LandingVideoConfig?.meeting_txt?.right_txt2}
              </div>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="-ml-1 rounded-lg bg-white py-1 outline-none"
              >
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleMobileDateSelect}
              className="bg-blue w-full rounded-lg p-3 text-white"
            >
              {LandingVideoConfig?.meeting_txt?.select_timezone}
            </button>
          </div>
        ) : (
          // Time selection screen
          <div className="flex h-[75vh] flex-col">
            <button
              onClick={() => setShowTimeSelection(false)}
              className="text-blue mb-4 flex items-center"
            >
              {LandingVideoConfig?.meeting_txt?.back_to_calendar}
            </button>
            <div className="mb-4 flex gap-2">
              <Image
                height={22}
                width={22}
                src={LandingVideoConfig?.meeting_txt?.right_img}
                alt="banner"
              />
              <span className="mr-4 text-base font-medium text-black">
                {formattedDate}
              </span>
              <span className="text-base font-normal text-black/30">
                {dayOfWeek}
              </span>
            </div>
            <div className="overflow-y-scroll">
              <ul className="space-y-3">
                {timeSlots.map((slot, index) => (
                  <li
                    key={index}
                    className="flex gap-2"
                    onClick={() => {
                      setSelectedTimeSlot(slot);
                      setShowMeetingModal(true);
                    }}
                  >
                    <div className="w-1/2 rounded-lg border border-black/10 p-3 text-black/80">
                      {slot?.start}
                    </div>
                    <div className="bg-blue w-1/2 rounded-lg p-3 text-center text-white">
                      {LandingVideoConfig?.meeting_txt?.confirm_txt}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View (768px and above) */}
      <div className="max-md:hidden">
        <div className="flex w-full justify-between">
          <div className="w-[65%]">
            <p className="text-blue text-lg font-semibold">
              {LandingVideoConfig?.meeting_txt?.right_txt1}
            </p>
            <div className="mb-8 mr-16 mt-6">
              <Calendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
            <div className="text-blue text-lg font-semibold">
              {LandingVideoConfig?.meeting_txt?.right_txt2}
            </div>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="-ml-2 mt-4 w-[35%] p-2 outline-none"
            >
              {timezones.map((timezone) => (
                <option key={timezone} value={timezone} className="">
                  {timezone}
                </option>
              ))}
            </select>
          </div>
          <div className="flex h-[calc(75vh)] w-[35%] flex-col">
            <div className="flex gap-2">
              <Image
                height={22}
                width={22}
                src={LandingVideoConfig?.meeting_txt?.right_img}
                alt="banner"
                className=""
              />
              <span className="mr-4 text-base font-medium text-black">
                {formattedDate}
              </span>
              <span className="text-base font-normal text-black/30">
                {dayOfWeek}
              </span>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto">
              {timeSlots.length > 0 ? (
                <ul className="h-max text-center">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="group mb-3 w-full hover:flex hover:gap-2"
                    >
                      <li className="rounded-lg border border-black/10 p-3 text-base font-normal text-black/80 group-hover:w-1/2 group-hover:border-black/5 group-hover:bg-black/5">
                        {slot?.start}
                      </li>
                      <div
                        className="bg-blue-light hidden rounded-lg p-3 text-base font-medium text-white hover:cursor-pointer group-hover:block group-hover:w-1/2"
                        onClick={() => {
                          setSelectedTimeSlot(slot);
                          handleSubmit(slot?.start, slot?.end);
                        }}
                      >
                        {LandingVideoConfig?.meeting_txt?.confirm_txt}
                      </div>
                    </div>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="flex animate-pulse space-x-2">
                      <div className="h-12 w-full rounded-lg bg-[#f8f8f8]"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
