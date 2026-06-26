import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import {
  GetCreditNotePdfParams,
  GetCreditNotePdfResponse,
  GetRefundsParams,
  GetRefundsResponse,
} from '../types/refunds';

export const refundsAPI = {
  getRefundDetails: async (
    params: GetRefundsParams
  ): Promise<GetRefundsResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/get-refund-details`;
    const response = await CentralAPIHandler.handlePostRequest(url, params);
    return response;
  },

  getCreditNotePdf: async (
    params: GetCreditNotePdfParams
  ): Promise<GetCreditNotePdfResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/get-creditnote-pdf`;
    const response = await CentralAPIHandler.handleGetRequest(url, params);
    return response;
  },
};
