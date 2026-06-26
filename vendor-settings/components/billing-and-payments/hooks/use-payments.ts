import { useEffect, useState } from 'react';

import { paymentsAPI } from '../api/payments';
import { PaymentRow } from '../payments/config';
import { TablePagination } from '../table-structure/types';
import {
  GetPaymentsResponse,
  PaymentFilter,
  PaymentFilters,
  PaymentItem,
  PaymentStatus,
} from '../types/payments';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

interface UsePaymentsParams {
  enterpriseId: string;
  initialPage?: number;
  initialLimit?: number;
}

export function usePayments({
  enterpriseId,
  initialPage = 1,
  initialLimit = 10,
}: UsePaymentsParams) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [pagination, setPagination] = useState<TablePagination>({
    page: initialPage,
    pageSize: initialLimit,
    total: 0,
  });
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildFilters = (filterObj: PaymentFilters): PaymentFilter[] => {
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

  const normalizeStatus = (status?: string): PaymentStatus => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'successful' || normalized === 'success') {
      return 'successful';
    }
    if (normalized === 'failed') {
      return 'failed';
    }
    if (normalized === 'processing' || normalized === 'in_progress') {
      return 'processing';
    }
    return 'draft';
  };

  const mapPaymentsToRows = (items: PaymentItem[]): PaymentRow[] => {
    return items.map((payment, idx) => {
      const status = normalizeStatus(payment.status as string);
      return {
        id: payment.paymentId || `payment-${pagination.page}-${idx}`,
        transactionDate: payment.transactionDate
          ? formatDate(payment.transactionDate)
          : '—',
        paymentId: payment.paymentId || 'N/A',
        invoices:
          payment.invoices?.map((invoice) => ({
            invoiceId: invoice.invoiceId,
            invoiceNumber: invoice.invoiceNumber,
            invoiceUrl: invoice.invoiceUrl,
          })) || [],
        paymentMethod: payment.paymentMode || 'N/A',
        status,
        amount:
          payment.amount !== undefined && payment.currency
            ? formatCurrency(payment.amount, payment.currency)
            : '—',
        failureReason: payment.failedReason,
        currency: payment.currency,
      };
    });
  };

  const fetchPayments = async (page: number = pagination.page) => {
    if (!enterpriseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiFilters = buildFilters(filters);
      const apiPage = Math.max(page - 1, 0);

      const response: GetPaymentsResponse = await paymentsAPI.getPaymentDetails(
        {
          enterpriseId,
          page: apiPage,
          limit: pagination.pageSize,
          filters: apiFilters.length > 0 ? apiFilters : undefined,
        }
      );

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch payments');
      }

      const { payments: items, pagination: apiPagination } = response.data;

      setPayments(mapPaymentsToRows(items));
      setPagination({
        page: (apiPagination?.page ?? apiPage) + 1,
        pageSize: apiPagination?.limit ?? pagination.pageSize,
        total: apiPagination?.total ?? items.length,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [enterpriseId, filters]);

  const handlePageChange = (newPage: number) => {
    fetchPayments(newPage);
  };

  const handleFiltersChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters);
  };

  const refetch = () => {
    fetchPayments(pagination.page);
  };

  return {
    payments,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFiltersChange,
    refetch,
  };
}
