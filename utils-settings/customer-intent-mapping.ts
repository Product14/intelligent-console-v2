// Customer Intent mapping for Overall component
export const CUSTOMER_INTENT_MAPPING: Record<string, string> = {
  RequestCallback: 'Requested callback from dealer',
  CheckVehicleAvailability: 'Checking vehicle availability',
  ScheduleAppointment: 'Schedule service appointment',
  InquireFinanceStatus: 'Inquire about financing',
  AskStaffMember: 'Ask staff member',
  CheckVehiclePrice: 'Check vehicle pricing',
  InquireTradeInValue: 'Inquire trade-in value',
  InquireWarranty: 'Inquire about warranty',
  InquireDeliveryStatus: 'Check delivery status',
  InquireRegistration: 'Inquire about registration',
  InquireServiceRepair: 'Service repair inquiry',
  ScheduleTestDrive: 'Schedule test drive',
  AskDealerLocation: 'Ask dealer location',
  RescheduleAppointment: 'Reschedule appointment',
  InquireLeaseOptions: 'Inquire lease options',
};

// Helper function to get customer intent descriptions
export const getCustomerIntentDescriptions = (
  customerIntents: string[]
): string[] => {
  return customerIntents
    .map((intent) => CUSTOMER_INTENT_MAPPING[intent])
    .filter(Boolean); // Remove any undefined mappings
};

// Helper function to format meeting time for appointment details
export const formatMeetingTime = (meeting: any): string[] => {
  if (!meeting || !meeting.meeting_start_time) {
    return [];
  }

  const startTime = new Date(meeting.meeting_start_time);

  // Format time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const weekday = startTime.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedTime = startTime.toLocaleTimeString('en-US', timeOptions);

  const appointmentDetails = [];

  // Add test drive appointment based on meeting intent
  if (meeting.intent === 'request_callback') {
    appointmentDetails.push(
      `Test drive scheduled on next ${weekday} at ${formattedTime}`
    );
  } else {
    appointmentDetails.push(
      `Appointment scheduled for ${weekday} at ${formattedTime}`
    );
  }

  // Add visit scheduled
  appointmentDetails.push(`Visit scheduled for ${weekday}`);

  return appointmentDetails;
};
