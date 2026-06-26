import React, { useEffect, useState } from 'react';

import SVG from '@spyne-console/design-system/svg';

import { useQueryParams } from '@spyne-console/hooks';

// @ts-ignore
import { fetchProductLineRegistries } from '@spyne-console/actions/admin-tools/overviews';

import { useRefunds } from '../hooks/use-refunds';
import TablePagination from '../table-structure/table-pagination';
import TableWrapper from '../table-structure/table-wrapper';
import { exportRefundsToCSV } from '../utils/csv-export';
import { refundsColumns } from './config';
import RefundFiltersComponent from './refund-filters';

export default function Refunds() {
  const { queryParams } = useQueryParams();
  const enterpriseId = queryParams.enterprise_id || '';
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );

  const {
    refunds,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFiltersChange,
  } = useRefunds({ enterpriseId, initialLimit: 10 });

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
        // eslint-disable-next-line no-console
        console.error('Failed to fetch products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleExportCSV = async () => {
    try {
      await exportRefundsToCSV(enterpriseId, filters);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to export refunds CSV:', err);
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
        <RefundFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExportCSV={handleExportCSV}
          products={products}
        />
        {!isLoading && refunds.length === 0 ? (
          <div className="flex h-[calc(100vh-290px)] flex-col items-center justify-center rounded-b-lg border border-black/10 bg-white">
            <SVG iconName="notFound" className="h-10 w-10" />
            <div className="text-center font-bold text-gray-500">
              No Credit Notes
            </div>
            <div className="text-center text-gray-500">
              All your refunds and credit notes will be visible here
            </div>
          </div>
        ) : (
          <>
            <TableWrapper
              columns={refundsColumns}
              data={refunds}
              pagination={pagination}
              onPageChange={handlePageChange}
              bodyClassName="h-[calc(100vh-290px)] overflow-y-auto border-t border-black/10"
              loadingState={{
                isLoading,
                skeletonRows: 11,
              }}
            />
            {refunds.length > 0 && (
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
