export interface ProductLine {
  productLineRegistryId: string;
  name: string;
  displayName: string;
  _id: string;
}

export interface InvoiceItem {
  _id: string;
  invoiceId: string;
  currency: string;
  dueDate: string;
  invoiceNumber: string;
  invoiceUrl: string;
  productLine: ProductLine[];
  raisedDate: string;
  // Backend sends PascalCase status values: "Paid", "Payment Due", "Partially Paid", "Overdue", "Void"
  status: 'Paid' | 'Payment Due' | 'Partially Paid' | 'Overdue' | 'Void';
  totalAmount: number;
}

export interface Pagination {
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

export interface Filter {
  filterName: 'raisedDate' | 'dueDate' | 'status' | 'product';
  value: DateFilter | string | string[];
}

export interface GetInvoicesParams {
  enterpriseId: string;
  page: number;
  limit: number;
  filters?: Filter[];
}

export interface GetInvoicesResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    invoices: InvoiceItem[];
    pagination: Pagination;
  };
}

export type InvoiceStatus =
  | 'payment_due'
  | 'partially_paid'
  | 'overdue'
  | 'paid'
  | 'void';

export interface InvoiceFilters {
  product?: string;
  status?: InvoiceStatus | InvoiceStatus[];
  raisedDateStart?: string;
  raisedDateEnd?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
}

export interface GetInvoicePdfParams {
  invoiceId: string;
}

export interface GetInvoicePdfResponse {
  message: string;
  error: boolean;
  code: string;
  details: null;
  data: {
    pdf: string;
    contentType: string;
    size: number;
    invoiceId: string;
    invoiceNumber: string;
  };
}
