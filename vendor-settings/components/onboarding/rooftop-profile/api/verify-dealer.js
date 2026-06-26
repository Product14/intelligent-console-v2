import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const verifyDealer = async ({
  enterpriseId,
  teamId,
  dealerId,
  providerName,
  providerType,
}) => {
  try {
    const url = `${process.env.BACKEND_BASEURL}/integrations/enterprise-integrations/verify-dealer`;
    return await CentralAPIHandler.handleGetRequest(url, {
      enterpriseId,
      teamId,
      dealerId,
      providerName,
      providerType,
    });
  } catch (error) {
    console.error('Error verifying dealer:', error);
    throw error;
  }
};
