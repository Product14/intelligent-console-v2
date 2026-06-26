import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const getWebsiteInfo = async (website) => {
  try {
    const url = `${process.env.BACKEND_BASEURL}/console/v1/product-onboarding/get-website-info`;
    return await CentralAPIHandler.handlePostRequest(url, { website });
  } catch (error) {
    console.error('Error fetching website info:', error);
    throw error;
  }
};
