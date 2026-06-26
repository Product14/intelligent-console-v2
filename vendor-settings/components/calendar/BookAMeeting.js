import { useInView } from '@react-spring/web';
import { useSelector } from '@spyne-console/store';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Image from 'next/image';

import { cn } from '@spyne-console/utils/cn';
import { newHubspotReport } from '@spyne-console/utils/config';

import DateAndTimeSelect from './DateAndTimeSelect';
import MeetingModal from './MeetingModal';
import { LandingVideoConfig } from './config';
import { fetchAvailability } from './get-time-slot';

function BookAMeeting({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dayOfWeek = selectedDate.toLocaleString('default', { weekday: 'long' });
  const timezones = Intl.supportedValuesOf('timeZone');
  const [meetingId, setMeetingId] = useState(null);
  const [ref, inView] = useInView({ threshold: 0.5 });
  const [updatedemailList, setUpdatedEmailList] = useState([]);
  const [emailList, setEmailList] = useState([]);
  const auth = useSelector((state) => state.authReducer);
  const isReseller = auth?.resellerData?.is_reseller || false;

  useEffect(() => {
    if (
      auth?.userName &&
      auth?.emailId &&
      !updatedemailList.some((item) => item.email === auth?.emailId)
    ) {
      setUpdatedEmailList([
        ...updatedemailList,
        { name: auth?.userName, email: auth?.emailId },
      ]);
      setEmailList([...emailList, auth?.emailId?.toString()]);
    }
  }, [auth?.userName, auth?.emailId]);

  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  const getFormattedDate = () => {
    const currentYear = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    return `${currentYear}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const formattedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
      try {
        const data = await fetchAvailability(formattedDate, selectedTimezone);
        setTimeSlots(data?.data?.intervals?.data?.intervals || []);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };
    fetchData();
  }, [selectedDate, selectedTimezone]);

  const handleDeleteAndReschedule = async () => {
    try {
      setShowMeetingModal(false);
      const deleteMeetingData = { eventId: meetingId };
      const url = `${process.env.APP_BACKEND_BASEURL}/spyne-websites/v1/google/calendar/delete-meeting`;
      const deleteResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteMeetingData),
      });
      if (deleteResponse.ok) {
        const deleteResponseData = await deleteResponse.json();
        return deleteResponseData;
      } else {
        console.error(
          'Failed to delete the meeting:',
          deleteResponse.status,
          deleteResponse.statusText
        );
      }
      setShowMeetingModal(false);
    } catch (error) {
      console.error('Error during delete and reschedule:', error);
    }
  };

  const addAttendees = async () => {
    if (newAttendees.length > 0) {
      const eventId = meetingId;
      const url = `${process.env.APP_BACKEND_BASEURL}/spyne-websites/v1/google/calendar/add-attendees`;
      const payload = {
        newAttendees: updatedemailList,
        eventId: eventId,
      };
    }
  };

  const handleSubmit = async (start, end) => {
    try {
      const formattedDate = await getFormattedDate();
      const start24h = await convertTo24Hour(start);
      const end24h = await convertTo24Hour(end);
      const formattedTimezone = await selectedTimezone.replace(/ /g, '_');
      if (!formattedDate || !start || !end) {
        console.error('Invalid date or timeslot information.');
        return;
      }
      const meetingData = {
        startTime: `${formattedDate} ${start24h}`,
        endTime: `${formattedDate} ${end24h}`,
        timeZone: formattedTimezone,
        attendees: emailList,
      };
      let payload = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData),
      };

      const url = `${process.env.APP_BACKEND_BASEURL}/spyne-websites/v1/google/calendar/schedule-meeting`;
      let hubSpotpayload = {
        email: auth?.emailId,
        upgrade_requested: 'true',
        meeting_date: formattedDate,
        meeting_time: start24h,
      };
      newHubspotReport(hubSpotpayload);

      const response = await fetch(url, payload);

      if (response.ok) {
        const responseData = await response.json();
        const meetingIdFromResponse = responseData.data?.id;
        setMeetingId(meetingIdFromResponse);
        setShowMeetingModal(true);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting. Please try again later.');
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300"
        >
          X
        </button>
      </div>

      <div className="border-blue/20 mx-auto flex h-full w-full overflow-hidden rounded-3xl border bg-white shadow-sm max-md:flex-col">
        {/* left side constant  */}
        {/* second screen */}
        {showMeetingModal && (
          <div
            className={cn(
              'flex h-[40vh] flex-col items-center justify-center text-center md:h-[70vh]',
              showMeetingModal ? 'w-full md:w-3/5' : 'w-1/2'
            )}
          >
            <Image
              src={LandingVideoConfig?.meeting_txt?.giftick}
              alt="giftick"
              width={300}
              height={300}
            />
            <p className="font-Poppins mb-5 text-[16px] font-medium leading-[24px] text-black/80 md:mb-9 md:text-lg md:leading-relaxed">
              Meeting Confirmed
            </p>
          </div>
        )}
        {/* first screen */}
        {!showMeetingModal && (
          <div className="border-r border-black/10 md:w-[28%]">
            <div className="h-[19.9dvh] w-full bg-gradient-to-l from-[#6883ee] via-[#585bf0] to-[#8659f8]">
              <div className="flex h-full w-full items-center gap-4 px-5 py-4 md:hidden">
                <Image
                  height={120}
                  width={120}
                  src={LandingVideoConfig?.meeting_txt?.dummyman}
                  alt="banner"
                  className="h-[70%] w-auto rounded-full border-2 border-white"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-semibold text-white">
                    {LandingVideoConfig?.meeting_txt?.left_txt3[0]?.txt}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="flex items-center gap-1 text-sm font-medium text-white">
                      <Image
                        src={LandingVideoConfig?.meeting_txt?.clockwhite}
                        alt={LandingVideoConfig?.meeting_txt?.clockwhite_alt}
                        width={15}
                        height={15}
                      />
                      {LandingVideoConfig?.meeting_txt?.left_txt3[1]?.txt}
                    </p>
                    <p className="flex items-center gap-1 text-sm font-medium text-white">
                      <Image
                        src={LandingVideoConfig?.meeting_txt?.locationWhite}
                        alt={LandingVideoConfig?.meeting_txt?.locationWhite_alt}
                        width={15}
                        height={15}
                      />
                      {LandingVideoConfig?.meeting_txt?.left_txt3[2]?.txt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Image
              height={120}
              width={120}
              src={LandingVideoConfig?.meeting_txt?.dummyman}
              alt="banner"
              className="-translate-y-[6dvh] translate-x-[4dvw] rounded-full bg-white object-cover p-1 max-md:hidden"
            />
            <div className="mx-12 max-md:hidden">
              <p className="mb-1 text-2xl font-semibold leading-loose text-black/80">
                {LandingVideoConfig?.meeting_txt?.left_txt1}
              </p>
              <p className="text-sm font-medium text-black/60">
                {LandingVideoConfig?.meeting_txt?.left_txt2}
              </p>
              <div className="mt-12">
                {LandingVideoConfig?.meeting_txt?.left_txt3.map(
                  (item, index) => (
                    <div key={index} className="mb-4 flex items-center">
                      <Image
                        src={item.img}
                        alt={`logo-${index}`}
                        width={24}
                        height={24}
                        className="mr-3"
                      />
                      <span className="text-base font-medium text-black/60">
                        {item.txt}
                      </span>
                    </div>
                  )
                )}
              </div>
              <div className="mb-6 mt-16">
                <p className="mb-2 text-sm font-medium text-black/60">
                  {LandingVideoConfig?.meeting_txt?.poweredby}
                </p>
                <Image
                  src={
                    isReseller
                      ? auth?.resellerData?.logo_url
                      : LandingVideoConfig?.meeting_txt?.spynelogomasked
                  }
                  alt={
                    isReseller
                      ? auth?.resellerData?.name
                      : LandingVideoConfig?.meeting_txt?.spynelogomasked_alt
                  }
                  width={120}
                  height={32}
                />
              </div>
            </div>
          </div>
        )}
        {/* right side dynamic */}
        <div
          className={`${showMeetingModal ? 'w-full md:w-2/5' : 'w-full p-5'}`}
        >
          {/* second screen */}
          {showMeetingModal && (
            <MeetingModal
              meetingId={meetingId}
              meetingModalOpen={true}
              setFinalSubmit={() => {}}
              selectedDate={selectedDate}
              selectedTimezone={selectedTimezone}
              selectedTimeSlot={selectedTimeSlot}
              setShowMeetingModal={setShowMeetingModal}
              updatedemailList={updatedemailList}
              setUpdatedEmailList={setUpdatedEmailList}
              emailList={emailList}
              setEmailList={setEmailList}
              handleDeleteAndReschedule={handleDeleteAndReschedule}
            />
          )}
          {/* first screen */}
          {!showMeetingModal && (
            <DateAndTimeSelect
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTimezone={selectedTimezone}
              setSelectedTimezone={setSelectedTimezone}
              LandingVideoConfig={LandingVideoConfig}
              timezones={timezones}
              formattedDate={formattedDate}
              dayOfWeek={dayOfWeek}
              timeSlots={timeSlots}
              setShowMeetingModal={setShowMeetingModal}
              setSelectedTimeSlot={setSelectedTimeSlot}
              showTimeSelection={showTimeSelection}
              setShowTimeSelection={setShowTimeSelection}
              handleSubmit={handleSubmit}
              updatedemailList={updatedemailList}
              setUpdatedEmailList={setUpdatedEmailList}
              emailList={emailList}
              setEmailList={setEmailList}
              selectedTimeSlot={selectedTimeSlot}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BookAMeeting;
