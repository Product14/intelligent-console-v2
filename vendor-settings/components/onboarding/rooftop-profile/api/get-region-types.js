import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const getRegionTypes = async () => {
  try {
    const url = `${process.env.BACKEND_BASEURL}/user-management/v1/team/get-region-types`;
    const response = await CentralAPIHandler.handleGetRequest(url);
    return transformRegionTypes(response);
  } catch (error) {
    throw error;
  }
};

export const transformRegionTypes = (response) => {
  if (!response.data.length) {
    return [];
  }

  return response.data.map((region) => ({
    label: region,
    value: region,
  }));
};
