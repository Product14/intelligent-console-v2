import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export interface PaymentInvoice {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
}

export interface CreatePaymentParams {
  invoices: PaymentInvoice[];
  totalAmount: number;
  currency: string;
  enterpriseId: string;
}

export interface CreatePaymentResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    checkoutSession: string;
  };
}

export const paymentAPI = {
  createPayment: async (
    params: CreatePaymentParams
  ): Promise<CreatePaymentResponse> => {
    const url = `${process.env.APP_BACKEND_BASEURL}/credit/v6/billing/create-payments`;
    const response = await CentralAPIHandler.handlePostRequest(url, params);
    return response;
  },
};
