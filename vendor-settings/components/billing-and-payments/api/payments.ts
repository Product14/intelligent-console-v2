import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import {
  CancelPaymentSessionParams,
  CancelPaymentSessionResponse,
  GetPaymentsParams,
  GetPaymentsResponse,
} from '../types/payments';

export const paymentsAPI = {
  getPaymentDetails: async (
    params: GetPaymentsParams
  ): Promise<GetPaymentsResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/get-payment-details`;
    const response = await CentralAPIHandler.handlePostRequest(url, params);
    return response;
  },

  cancelPaymentSession: async (
    params: CancelPaymentSessionParams
  ): Promise<CancelPaymentSessionResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/cancel-payment-session`;
    const response = await CentralAPIHandler.handlePostRequest(url, params);
    return response;
  },
};
