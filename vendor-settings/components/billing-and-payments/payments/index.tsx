import React from 'react';

import SVG from '@spyne-console/design-system/svg';

import { useQueryParams } from '@spyne-console/hooks';

import { usePayments } from '../hooks/use-payments';
import TablePagination from '../table-structure/table-pagination';
import TableWrapper from '../table-structure/table-wrapper';
import { exportPaymentsToCSV } from '../utils/csv-export';
import { paymentsColumns } from './config';
import PaymentFiltersBar from './payment-filters';

export default function Payments() {
  const { queryParams } = useQueryParams();
  const enterpriseId = queryParams.enterprise_id || '';

  const {
    payments,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFiltersChange,
  } = usePayments({ enterpriseId, initialLimit: 10 });

  const handleExportCSV = async () => {
    try {
      await exportPaymentsToCSV(enterpriseId, filters);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to export payments CSV:', err);
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
    <div className="w-full">
      <div className="w-full shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04)]">
        <PaymentFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExportCSV={handleExportCSV}
        />
        {!isLoading && payments.length === 0 ? (
          <div className="flex h-[calc(100vh-290px)] flex-col items-center justify-center rounded-b-lg border border-black/10 bg-white">
            <SVG iconName="notFound" className="h-10 w-10" />
            <div className="text-center font-bold text-gray-500">
              No payments
            </div>
            <div className="text-center text-gray-500">
              All your transactions and invoice payments will be here
            </div>
          </div>
        ) : (
          <>
            <TableWrapper
              columns={paymentsColumns}
              data={payments}
              pagination={pagination}
              onPageChange={handlePageChange}
              bodyClassName="h-[calc(100vh-290px)] overflow-y-auto border-t border-black/10"
              loadingState={{
                isLoading,
                skeletonRows: 11,
              }}
              getRowClassName={(row) =>
                row.status === 'failed' ? 'bg-red-50/50' : ''
              }
            />
            {payments.length > 0 && (
              <TablePagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
