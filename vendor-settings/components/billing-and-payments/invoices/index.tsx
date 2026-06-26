import React, { useEffect, useState } from 'react';

import SVG from '@spyne-console/design-system/svg';

import { useQueryParams } from '@spyne-console/hooks';

// @ts-ignore
import { fetchProductLineRegistries } from '@spyne-console/actions/admin-tools/overviews';

import { useInvoices } from '../hooks/use-invoices';
import { usePayment } from '../hooks/use-payment';
import { InvoiceItem } from '../types/invoices';
import { exportInvoicesToCSV } from '../utils/csv-export';
import InvoiceFiltersComponent from './invoice-filters';
import InvoiceTable from './invoice-table';
import Pagination from './pagination';

interface InvoicesProps {
  hasProcessingPayment?: boolean;
}

export default function Invoices({
  hasProcessingPayment = false,
}: InvoicesProps) {
  const { queryParams } = useQueryParams();
  const enterpriseId = queryParams.enterprise_id || '';
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );

  const {
    invoices,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFiltersChange,
    refetch,
  } = useInvoices({ enterpriseId, initialLimit: 10 });

  // Payment hook
  const { isProcessing, paySingleInvoice } = usePayment({
    enterpriseId,
    onSuccess: () => {
      // Refetch invoices after successful payment
      refetch();
    },
    onError: (error) => {
      alert(`Payment failed: ${error}`);
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchProductLineRegistries();
        if (!response.error && response.data) {
          setProducts(
            response.data.map((p: { id: string; name: string }) => ({
              id: p.id,
              name: p.name,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handlePay = async (invoiceId: string, invoice: InvoiceItem) => {
    await paySingleInvoice(invoice, invoice.currency);
  };

  const handleView = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  const handleDownload = async (invoiceUrl: string) => {
    try {
      const response = await fetch(invoiceUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      window.open(invoiceUrl, '_blank');
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportInvoicesToCSV(enterpriseId, filters);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <InvoiceFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExportCSV={handleExportCSV}
        products={products}
      />

      <div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">Loading invoices...</div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex h-[calc(100vh-290px)] flex-col items-center justify-center rounded-b-lg border border-black/10 bg-white">
            <SVG iconName="notFound" className="h-10 w-10" />
            <div className="text-center text-gray-500">No invoices found</div>
            <div className="text-center text-gray-500">
              All your raised invoices will be available here
            </div>
          </div>
        ) : (
          <div>
            <InvoiceTable
              invoices={invoices}
              onPay={handlePay}
              onView={handleView}
              onDownload={handleDownload}
              isProcessing={isProcessing}
              hasProcessingPayment={hasProcessingPayment}
            />
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
