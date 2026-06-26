import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const getRooftopData = async (teamId) => {
  try {
    const url = `${process.env.BACKEND_BASEURL}/user-management/v1/team/get-team-details`;
    const response = await CentralAPIHandler.handleGetRequest(url, {
      team_id: teamId,
    });
    return response;
  } catch (error) {
    console.error('Error fetching rooftop data:', error);
    throw error;
  }
};

export const transformRooftopData = (apiData) => {
  const team = apiData?.data?.team;
  const user = apiData?.data?.user;

  const isdCode = user?.isdCode || '';
  const contactNo = user?.contactNo || '';
  const sanitizedIsdCode = isdCode.replace('+', '');
  const constructedPhone = `${sanitizedIsdCode}${contactNo}`;

  return {
    rooftopId: team?.teamId || '',
    rooftopName: team?.teamName || '',
    website: team?.websiteLink || '',
    websiteListingUrl: team?.websiteListingUrl || '',
    adminName: user?.userName || '',
    adminEmail: user?.emailId || '',
    adminPhone: constructedPhone,
    adminUserId: user?.userId || '',
    isdCode: isdCode || '',
    dealerType: team?.teamType || '',
    dealerSubType: team?.teamSubType || '',
    rooftopAddress: team?.address || null,
    region: team?.regionType || '',
    timezone: team?.timeZone || '',
    enterpriseId: team?.enterpriseId || '',
    geoCoordinates: team?.geoCoordinates || null,
  };
};
