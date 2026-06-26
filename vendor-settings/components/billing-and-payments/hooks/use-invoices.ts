import { useEffect, useState } from 'react';

import { invoicesAPI } from '../api/invoices';
import {
  Filter,
  GetInvoicesResponse,
  InvoiceFilters,
  InvoiceItem,
  Pagination,
} from '../types/invoices';

interface UseInvoicesParams {
  enterpriseId: string;
  initialPage?: number;
  initialLimit?: number;
}

export function useInvoices({
  enterpriseId,
  initialPage = 0,
  initialLimit = 20,
}: UseInvoicesParams) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildFilters = (filterObj: InvoiceFilters): Filter[] => {
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

  const fetchInvoices = async (page: number = pagination.page) => {
    if (!enterpriseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiFilters = buildFilters(filters);
      const response: GetInvoicesResponse = await invoicesAPI.getInvoices({
        enterpriseId,
        page,
        limit: pagination.limit,
        filters: apiFilters.length > 0 ? apiFilters : undefined,
      });

      if (response.error) {
        setError(response.message || 'Failed to fetch invoices');
      } else {
        setInvoices(response.data.invoices);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while fetching invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(0);
  }, [enterpriseId, filters]);

  const handlePageChange = (newPage: number) => {
    fetchInvoices(newPage);
  };

  const handleFiltersChange = (newFilters: InvoiceFilters) => {
    setFilters(newFilters);
  };

  const refetch = () => {
    fetchInvoices(pagination.page);
  };

  return {
    invoices,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFiltersChange,
    refetch,
  };
}
