import { useEffect, useState } from 'react';

import { refundsAPI } from '../api/refunds';
import { RefundRow } from '../refunds/config';
import { TablePagination } from '../table-structure/types';
import {
  GetRefundsResponse,
  RefundFilter,
  RefundFilters,
  RefundItem,
} from '../types/refunds';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

interface UseRefundsParams {
  enterpriseId: string;
  initialPage?: number;
  initialLimit?: number;
}

export function useRefunds({
  enterpriseId,
  initialPage = 1,
  initialLimit = 10,
}: UseRefundsParams) {
  const [refunds, setRefunds] = useState<RefundRow[]>([]);
  const [pagination, setPagination] = useState<TablePagination>({
    page: initialPage,
    pageSize: initialLimit,
    total: 0,
  });
  const [filters, setFilters] = useState<RefundFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildFilters = (filterObj: RefundFilters): RefundFilter[] => {
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

  const normalizeProductName = (name: string): 'studioAi' | 'viniAi' => {
    const normalized = name.toLowerCase().trim();
    if (normalized === 'studioai' || normalized === 'studio ai') {
      return 'studioAi';
    }
    if (
      normalized === 'viniai' ||
      normalized === 'vini ai' ||
      normalized === 'conversationalai' ||
      normalized === 'conversational ai'
    ) {
      return 'viniAi';
    }
    // Default to studioAi if unknown
    return 'studioAi';
  };

  const mapRefundsToRows = (items: RefundItem[]): RefundRow[] => {
    return items.map((refund, idx) => {
      // Map all products from productLine array
      const products = refund.productLine?.length
        ? refund.productLine.map((pl) => normalizeProductName(pl.name))
        : ['studioAi' as const];

      return {
        id: refund.creditnoteId || `refund-${pagination.page}-${idx}`,
        creditNoteId: refund.creditnoteNumber || refund.creditnoteId || 'N/A',
        products,
        invoices:
          refund.invoices?.map((invoice) => invoice.invoiceNumber) || [],
        raisedOn: refund.raisedOn ? formatDate(refund.raisedOn) : '—',
        status: refund.status,
        creditAmount:
          refund.total !== undefined
            ? formatCurrency(refund.total, refund.currency || 'USD')
            : '—',
        currency: refund.currency || 'USD',
        invoiceDetails: refund.invoices || [],
      };
    });
  };

  const fetchRefunds = async (page: number = pagination.page) => {
    if (!enterpriseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiFilters = buildFilters(filters);
      const apiPage = Math.max(page - 1, 0);

      const response: GetRefundsResponse = await refundsAPI.getRefundDetails({
        enterpriseId,
        page: apiPage,
        limit: pagination.pageSize,
        filters: apiFilters.length > 0 ? apiFilters : undefined,
      });

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch refunds');
      }

      const { creditNotes, pagination: apiPagination } = response.data;

      setRefunds(mapRefundsToRows(creditNotes));
      setPagination({
        page: (apiPagination?.page ?? apiPage) + 1,
        pageSize: apiPagination?.limit ?? pagination.pageSize,
        total: apiPagination?.total ?? creditNotes.length,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch refunds');
      setRefunds([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds(1);
  }, [enterpriseId, filters]);

  const handlePageChange = (newPage: number) => {
    fetchRefunds(newPage);
  };

  const handleFiltersChange = (newFilters: RefundFilters) => {
    setFilters(newFilters);
  };

  const refetch = () => {
    fetchRefunds(pagination.page);
  };

  return {
    refunds,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFiltersChange,
    refetch,
  };
}
