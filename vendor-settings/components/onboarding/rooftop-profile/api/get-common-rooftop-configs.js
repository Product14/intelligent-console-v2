import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const transformCommonRooftopConfigsResponse = (apiResponse) => {
  if (!apiResponse || !apiResponse.data) {
    return null;
  }

  const { data } = apiResponse;

  return {
    vehicleType: {
      new: !!data.entityconfig?.vehicleType?.new,
      preOwned: !!data.entityconfig?.vehicleType?.preOwned,
    },
    serviceAddress: data.entityconfig?.serviceAddress,
    financeAddress: data.entityconfig?.financeAddress,
    salesAddress: data.entityconfig?.salesAddress,
    partsAddress: data.entityconfig?.partsAddress,
  };
};

export const getCommonRooftopConfigs = async (params) => {
  try {
    const url = `${process.env.BACKEND_BASEURL}/central-config/v1/integration`;

    const queryParams = {
      enterpriseId: params.enterpriseId,
      teamId: params.teamId,
      domain: 'rooftop',
      entity: 'INFO',
    };

    const response = await CentralAPIHandler.handleGetRequest(url, queryParams);

    return transformCommonRooftopConfigsResponse(response);
  } catch (error) {
    throw error;
  }
};
