import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import {
  GetPlanDetailsParams,
  GetPlanDetailsResponse,
} from '../types/plan-details';

export const planDetailsAPI = {
  getPlanDetails: async (
    params: GetPlanDetailsParams
  ): Promise<GetPlanDetailsResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/get-plan-details`;
    const response = await CentralAPIHandler.handleGetRequest(url, params);
    return response;
  },
};
