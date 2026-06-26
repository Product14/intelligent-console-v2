import { invoicesAPI } from '../api/invoices';
import { paymentsAPI } from '../api/payments';
// Refunds CSV Export
import { refundsAPI } from '../api/refunds';
import { Filter, InvoiceFilters, InvoiceItem } from '../types/invoices';
import { PaymentFilter, PaymentFilters, PaymentItem } from '../types/payments';
import { RefundFilter, RefundFilters, RefundItem } from '../types/refunds';
import { formatCurrency } from './currency';
import { formatDate } from './date';
import { normalizeProductName } from './product-styles';

export const buildFilters = (filterObj: InvoiceFilters): Filter[] => {
  const apiFilters: Filter[] = [];

  if (filterObj.raisedDateStart && filterObj.raisedDateEnd) {
    apiFilters.push({
      filterName: 'raisedDate',
      value: {
        start: filterObj.raisedDateStart,
        end: filterObj.raisedDateEnd,
      },
    });
  }

  if (filterObj.dueDateStart && filterObj.dueDateEnd) {
    apiFilters.push({
      filterName: 'dueDate',
      value: {
        start: filterObj.dueDateStart,
        end: filterObj.dueDateEnd,
      },
    });
  }

  if (filterObj.status) {
    apiFilters.push({
      filterName: 'status',
      value: filterObj.status,
    });
  }

  if (filterObj.product) {
    apiFilters.push({
      filterName: 'product',
      value: filterObj.product,
    });
  }

  return apiFilters;
};

export const fetchAllInvoices = async (
  enterpriseId: string,
  filters: InvoiceFilters,
  limit: number = 100
): Promise<InvoiceItem[]> => {
  const allInvoices: InvoiceItem[] = [];
  const apiFilters = buildFilters(filters);
  let currentPage = 0;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await invoicesAPI.getInvoices({
        enterpriseId,
        page: currentPage,
        limit,
        filters: apiFilters.length > 0 ? apiFilters : undefined,
      });

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch invoices');
      }

      allInvoices.push(...response.data.invoices);

      hasMorePages = response.data.pagination.hasNextPage;
      currentPage++;
    } catch (error) {
      console.error('Error fetching invoices for CSV:', error);
      throw error;
    }
  }

  return allInvoices;
};

export const convertInvoicesToCSV = (invoices: InvoiceItem[]): string => {
  const headers = [
    'Invoice ID',
    'Invoice Number',
    'Products',
    'Raised Date',
    'Due Date',
    'Status',
    'Currency',
    'Amount',
    'Invoice URL',
  ];

  const rows = invoices.map((invoice) => {
    const products = invoice.productLine
      .map((p) => normalizeProductName(p.displayName))
      .join('; ');
    const raisedDate = formatDate(invoice.raisedDate);
    const dueDate = formatDate(invoice.dueDate);
    const amount = formatCurrency(invoice.totalAmount, invoice.currency);

    return [
      invoice.invoiceId,
      invoice.invoiceNumber,
      products || 'N/A',
      raisedDate,
      dueDate,
      invoice.status,
      invoice.currency,
      amount,
      invoice.invoiceUrl,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell || '');
          if (
            cellStr.includes(',') ||
            cellStr.includes('"') ||
            cellStr.includes('\n')
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportInvoicesToCSV = async (
  enterpriseId: string,
  filters: InvoiceFilters
): Promise<void> => {
  try {
    const allInvoices = await fetchAllInvoices(enterpriseId, filters);
    const csvContent = convertInvoicesToCSV(allInvoices);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `invoices_${timestamp}.csv`;
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw error;
  }
};

export const buildPaymentFilters = (
  filterObj: PaymentFilters
): PaymentFilter[] => {
  const apiFilters: PaymentFilter[] = [];

  if (filterObj.transactionDateStart && filterObj.transactionDateEnd) {
    apiFilters.push({
      filterName: 'transactionDate',
      value: {
        start: filterObj.transactionDateStart,
        end: filterObj.transactionDateEnd,
      },
    });
  }

  if (filterObj.status) {
    apiFilters.push({
      filterName: 'status',
      value: filterObj.status,
    });
  }

  return apiFilters;
};

export const fetchAllPayments = async (
  enterpriseId: string,
  filters: PaymentFilters,
  limit: number = 100
): Promise<PaymentItem[]> => {
  const allPayments: PaymentItem[] = [];
  const apiFilters = buildPaymentFilters(filters);
  let currentPage = 0;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await paymentsAPI.getPaymentDetails({
        enterpriseId,
        page: currentPage,
        limit,
        filters: apiFilters.length > 0 ? apiFilters : undefined,
      });

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch payments');
      }

      allPayments.push(...response.data.payments);

      hasMorePages = response.data.pagination.hasNextPage;
      currentPage++;
    } catch (error) {
      console.error('Error fetching payments for CSV:', error);
      throw error;
    }
  }

  return allPayments;
};

export const convertPaymentsToCSV = (payments: PaymentItem[]): string => {
  const headers = [
    'Payment ID',
    'Amount',
    'Currency',
    'Payment Mode',
    'Status',
    'Failed Reason',
    'Transaction Date',
    'Invoices (Numbers)',
    'Invoices (URLs)',
  ];

  const rows = payments.map((payment) => {
    const amount =
      payment.amount !== undefined && payment.currency
        ? formatCurrency(payment.amount, payment.currency)
        : '';
    const transactionDate = payment.transactionDate
      ? formatDate(payment.transactionDate)
      : '';
    const invoiceNumbers =
      payment.invoices
        ?.map((invoice) => invoice.invoiceNumber || invoice.invoiceId)
        .join('; ') || 'N/A';
    const invoiceUrls =
      payment.invoices?.map((invoice) => invoice.invoiceUrl).join('; ') ||
      'N/A';

    return [
      payment.paymentId,
      amount,
      payment.currency,
      payment.paymentMode,
      payment.status,
      payment.failedReason ?? '',
      transactionDate,
      invoiceNumbers,
      invoiceUrls,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell ?? '');
          if (
            cellStr.includes(',') ||
            cellStr.includes('"') ||
            cellStr.includes('\n')
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');

  return csvContent;
};

export const exportPaymentsToCSV = async (
  enterpriseId: string,
  filters: PaymentFilters
): Promise<void> => {
  try {
    const allPayments = await fetchAllPayments(enterpriseId, filters);
    const csvContent = convertPaymentsToCSV(allPayments);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `payments_${timestamp}.csv`;
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Failed to export payments CSV:', error);
    throw error;
  }
};

export const buildRefundFilters = (
  filterObj: RefundFilters
): RefundFilter[] => {
  const apiFilters: RefundFilter[] = [];

  if (filterObj.raisedDateStart && filterObj.raisedDateEnd) {
    apiFilters.push({
      filterName: 'raisedOn',
      value: {
        start: filterObj.raisedDateStart,
        end: filterObj.raisedDateEnd,
      },
    });
  }

  if (filterObj.status) {
    apiFilters.push({
      filterName: 'status',
      value: filterObj.status,
    });
  }

  if (filterObj.product) {
    apiFilters.push({
      filterName: 'productLineRegistryId',
      value: filterObj.product,
    });
  }

  return apiFilters;
};

export const fetchAllRefunds = async (
  enterpriseId: string,
  filters: RefundFilters,
  limit: number = 100
): Promise<RefundItem[]> => {
  const allRefunds: RefundItem[] = [];
  const apiFilters = buildRefundFilters(filters);
  let currentPage = 0;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await refundsAPI.getRefundDetails({
        enterpriseId,
        page: currentPage,
        limit,
        filters: apiFilters.length > 0 ? apiFilters : undefined,
      });

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch refunds');
      }

      allRefunds.push(...response.data.creditNotes);

      hasMorePages = response.data.pagination.hasNextPage;
      currentPage++;
    } catch (error) {
      console.error('Error fetching refunds for CSV:', error);
      throw error;
    }
  }

  return allRefunds;
};

export const convertRefundsToCSV = (refunds: RefundItem[]): string => {
  const headers = [
    'Credit Note ID',
    'Credit Note Number',
    'Products',
    'Raised On',
    'Status',
    'Currency',
    'Credit Amount',
    'Invoices (Numbers)',
    'Invoices (URLs)',
  ];

  const rows = refunds.map((refund) => {
    const products = refund.productLine
      .map((p) => normalizeProductName(p.displayName))
      .join('; ');
    const raisedOn = formatDate(refund.raisedOn);
    const amount = formatCurrency(refund.total, refund.currency);
    const invoiceNumbers =
      refund.invoices
        ?.map((invoice) => invoice.invoiceNumber || invoice.invoiceId)
        .join('; ') || 'N/A';
    const invoiceUrls =
      refund.invoices?.map((invoice) => invoice.invoiceUrl).join('; ') || 'N/A';

    return [
      refund.creditnoteId,
      refund.creditnoteNumber,
      products || 'N/A',
      raisedOn,
      refund.status,
      refund.currency,
      amount,
      invoiceNumbers,
      invoiceUrls,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell ?? '');
          if (
            cellStr.includes(',') ||
            cellStr.includes('"') ||
            cellStr.includes('\n')
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');

  return csvContent;
};

export const exportRefundsToCSV = async (
  enterpriseId: string,
  filters: RefundFilters
): Promise<void> => {
  try {
    const allRefunds = await fetchAllRefunds(enterpriseId, filters);
    const csvContent = convertRefundsToCSV(allRefunds);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `refunds_${timestamp}.csv`;
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Failed to export refunds CSV:', error);
    throw error;
  }
};
