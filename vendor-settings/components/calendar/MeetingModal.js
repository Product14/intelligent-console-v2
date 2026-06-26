import { useSelector } from '@spyne-console/store';

// import { eventCaptureDataHome } from "@/components/home-page/config";
import React, { useEffect, useRef, useState } from 'react';

import { Router } from 'next/router';

// import { submitLeads } from "@/actions/submit-leads";
// import { newHubspotReport } from "@/lib/commonFunctions";
// import { captureEvents } from "@/lib/commonFunctions";

import { contactFormModalCommonData } from './config';

function MeetingModal({
  meetingId,
  meetingModalOpen,
  selectedDate,
  selectedTimezone,
  selectedTimeSlot,
  setShowMeetingModal,
  updatedemailList,
  setUpdatedEmailList,
  emailList,
  setEmailList,
  handleDeleteAndReschedule,
}) {
  const [invitefield, setInvitefield] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newEmail) {
        const emails = newEmail
          .split(',')
          .map((email) => email.trim())
          .filter((email) => email);
        const newEntries = emails.map((email) => ({ email }));
        setEmailList((prev) => [...prev, ...newEntries]);
        setNewEmail('');
      }
    }
  };

  const handleChipRemove = (emailToRemove) => {
    setEmailList((prev) => prev.filter((item) => item.email !== emailToRemove));
  };
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newEmail]);

  return (
    <div
      className={`bg-gray-247 mb-5 flex h-full w-full flex-col items-center justify-center gap-y-3 overflow-y-scroll rounded-xl px-4 py-4 md:w-11/12 md:items-start md:justify-start md:gap-y-4 md:overflow-hidden md:px-6 md:py-5 lg:mb-auto lg:px-8 lg:py-7 ${meetingModalOpen ? '' : 'hidden'}`}
    >
      {/* ///////////reschedule section//////////// */}
      <div className="relative mb-2 flex w-[300px] flex-col rounded-xl bg-gray-100 md:mb-4">
        <div className="absolute -right-3 top-[49.3%] h-6 w-6 -translate-y-[70%] rounded-full bg-white"></div>
        <div className="absolute -left-3 top-[49.3%] h-6 w-6 -translate-y-[70%] rounded-full bg-white"></div>

        <div className="flex flex-col items-center justify-center border-b border-dashed px-3 py-3">
          <img
            src={contactFormModalCommonData?.dummyman}
            alt="person image"
            className="mb-2 h-12 rounded-full"
          />
          <div className="w-full">
            <div className="mb-1 text-center text-xs font-normal text-black/50">
              {contactFormModalCommonData?.meetingModaltxt2}
            </div>
            <div className="text-center text-base font-semibold text-black/90">
              Jessica
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-start px-3 py-3">
          <div className="mb-3 flex gap-3">
            <img
              src={contactFormModalCommonData?.calLogo}
              alt="calender logo"
              className="h-4 translate-y-[2px]"
            />
            <div>
              <p className="text-sm font-medium text-black">
                {selectedDate?.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs font-normal text-black/50">
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                })}
              </p>
            </div>
          </div>
          <div className="mb-3 flex gap-3">
            <img
              src={contactFormModalCommonData?.clock}
              alt="calender logo"
              className="h-4 translate-y-[2px]"
            />
            <div>
              <p className="text-sm font-medium text-black">
                {selectedTimeSlot?.start} - {selectedTimeSlot?.end}
              </p>
              <p className="text-xs font-normal text-black/50">
                {selectedTimezone}
              </p>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <button
              className="text-blue w-fit cursor-pointer rounded-lg bg-[#ECE5FE] px-4 py-2 text-sm font-semibold"
              onClick={() => {
                handleDeleteAndReschedule();
              }}
            >
              {contactFormModalCommonData?.meetingModaltxt4}
            </button>
          </div>
        </div>
      </div>
      {/* adding participents */}
      <div className="flex w-full flex-col justify-start">
        <div className="pb-3 text-xs font-medium tracking-wide text-black/40">
          {contactFormModalCommonData?.meetingModaltxt3}
        </div>
        <div className="h-[12dvh] overflow-auto">
          <div className="mb-2 flex w-fit flex-wrap gap-2 rounded-full bg-white py-2 pl-2 pr-3">
            <img
              src={contactFormModalCommonData?.dummyman}
              alt="image email"
              className="h-5 w-5 rounded-full"
            />
            <p className="text-blue-35 text-sm font-semibold">Jessica</p>
            <p className="bg-white text-sm font-normal text-black/40">
              jessica.bosch@spyne.ai
            </p>
          </div>
          {updatedemailList.map((item, index) => (
            <div
              key={index}
              className="mb-2 flex w-fit flex-wrap gap-2 rounded-full bg-white py-2 pl-2 pr-3"
            >
              <div className="bg-blue-light flex h-5 w-5 items-center justify-center rounded-full border-none text-xs text-white">
                {item?.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-blue-35 text-sm font-semibold">{item?.name}</p>
              <p className="bg-white text-sm font-normal text-black/40">
                {item?.email}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-3">
          {invitefield ? (
            <div className="border-blue flex w-[67%] flex-col overflow-scroll rounded border bg-white px-2 py-[1px]">
              <div className="flex flex-wrap">
                {emailList.map((item, index) => (
                  <div
                    key={index}
                    className="m-1 flex w-fit items-center gap-3 rounded-full bg-[#ECE5FE] py-1 pl-3 pr-1"
                  >
                    <p className="text-blue text-sm font-semibold">
                      {item.email}
                    </p>
                    <button
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black"
                      onClick={() => handleChipRemove(item.email)}
                    >
                      <p>&times;</p>
                    </button>
                  </div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add email addresses to invite guests"
                className="flex-1 resize-none whitespace-nowrap border-none p-2 focus:outline-none"
                rows={1}
              />
            </div>
          ) : null}
          {/* <button
            className="px-4 md:py-3 py-2 bg-[#ECE5FE] text-blue text-sm font-semibold w-fit rounded-lg whitespace-nowrap cursor-pointer"
            onClick={() => {
              handleButtonClick();
              setInvitefield(!invitefield);
            }}
          >
            {contactFormModalCommonData?.meetingModaltxt5}
          </button> */}
          <></>
        </div>
      </div>
    </div>
  );
}

export default MeetingModal;
