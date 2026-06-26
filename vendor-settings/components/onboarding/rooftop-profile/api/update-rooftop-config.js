import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const updateRooftopConfig = async (payload) => {
  try {
    const url = `${process.env.BACKEND_BASEURL}/console/v1/product-onboarding/update-rooftop-data`;
    return await CentralAPIHandler.handlePostRequest(url, payload);
  } catch (error) {
    console.error('Error updating rooftop config:', error);
    throw error;
  }
};
