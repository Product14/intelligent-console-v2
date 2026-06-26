export type PaymentStatus = 'successful' | 'failed' | 'processing' | string;

export interface PaymentInvoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceUrl: string;
}

export interface PaymentItem {
  paymentId: string;
  amount: number;
  paymentMode: string;
  currency: string;
  status: PaymentStatus | string;
  failedReason?: string | null;
  transactionDate: string | null;
  invoices: PaymentInvoice[];
  sessionId?: string;
  sessionUrl?: string;
}

export interface PaymentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaymentDateFilter {
  start: string;
  end: string;
}

export interface PaymentFilter {
  filterName: 'transactionDate' | 'status';
  value: PaymentDateFilter | string | string[];
}

export interface GetPaymentsParams {
  enterpriseId: string;
  page: number;
  limit: number;
  filters?: PaymentFilter[];
}

export interface GetPaymentsResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    payments: PaymentItem[];
    pagination: PaymentsPagination;
  };
}

export interface PaymentFilters {
  status?: PaymentStatus | PaymentStatus[];
  transactionDateStart?: string;
  transactionDateEnd?: string;
}

export interface CancelPaymentSessionParams {
  sessionId: string;
  paymentId?: string;
  enterpriseId?: string;
}

export interface CancelPaymentSessionResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: null;
}
