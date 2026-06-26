import CentralAPIHandler from '../login/centralAPIHandler/centralAPIHandler';

export async function fetchAvailability(formattedDate, selectedTimezone) {
  try {
    const url = `https://api.spyne.ai/spyne-websites/v1/google/calendar/check-availability`;
    const response = await CentralAPIHandler.handleGetRequest(url, {
      selectedDate: formattedDate,
      timeZone: selectedTimezone,
    });
    return response;
  } catch (err) {
    console.error('Error fetching availability data:', err);
  }
}
