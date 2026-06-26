export interface ProductLine {
  productLineRegistryId: string;
  name: string;
  displayName: string;
  _id: string;
}

export interface RefundInvoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceUrl: string;
}

export interface RefundItem {
  creditnoteId: string;
  creditnoteNumber: string;
  currency: string;
  total: number;
  status: 'pending' | 'processed' | 'void';
  raisedOn: string;
  productLine: ProductLine[];
  invoices: RefundInvoice[];
}

export interface RefundsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DateFilter {
  start: string;
  end: string;
}

export interface RefundFilter {
  filterName: 'status' | 'raisedOn' | 'productLineRegistryId';
  value: DateFilter | string | string[];
}

export interface GetRefundsParams {
  enterpriseId: string;
  page: number;
  limit: number;
  filters?: RefundFilter[];
}

export interface GetRefundsResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    creditNotes: RefundItem[];
    pagination: RefundsPagination;
  };
}

export type RefundStatus = 'pending' | 'processed' | 'void';

export interface RefundFilters {
  product?: string;
  status?: RefundStatus | RefundStatus[];
  raisedDateStart?: string;
  raisedDateEnd?: string;
}

export interface GetCreditNotePdfParams {
  creditnoteId: string;
}

export interface GetCreditNotePdfResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    pdf: string;
    contentType: string;
    size: number;
    creditnoteId: string;
    creditnoteNumber: string;
  };
}
