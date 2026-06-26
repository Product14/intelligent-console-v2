import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import {
  GetInvoicePdfParams,
  GetInvoicePdfResponse,
  GetInvoicesParams,
  GetInvoicesResponse,
} from '../types/invoices';

export const invoicesAPI = {
  getInvoices: async (
    params: GetInvoicesParams
  ): Promise<GetInvoicesResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/get-invoices`;
    const response = await CentralAPIHandler.handlePostRequest(url, params);
    return response;
  },

  getInvoicePdf: async (
    params: GetInvoicePdfParams
  ): Promise<GetInvoicePdfResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/get-invoice-pdf`;
    const response = await CentralAPIHandler.handleGetRequest(url, params);
    return response;
  },
};
