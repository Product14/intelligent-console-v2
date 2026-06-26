import React from 'react';

import SVG from '@spyne-console/design-system/svg';

import { TableColumn } from '../table-structure/types';
import { PaymentStatus } from '../types/payments';
import { handleViewInvoice } from '../utils/pdf';

export interface PaymentInvoiceRow {
  invoiceId: string;
  invoiceNumber: string;
  invoiceUrl: string;
}

export interface PaymentRow {
  id: string;
  transactionDate: string;
  paymentId: string;
  invoices: PaymentInvoiceRow[];
  paymentMethod: string;
  status: PaymentStatus | string;
  amount: string;
  failureReason?: string | null;
  currency?: string;
}

const STATUS_LABELS: Record<string, string> = {
  successful: 'Successful',
  failed: 'Failed',
  processing: 'Processing',
  draft: 'Draft',
};

const STATUS_CLASSES: Record<string, string> = {
  successful:
    'bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-xs font-medium',
  failed:
    'bg-orange-red text-white/85 rounded-full px-3 py-1 text-xs w-fit font-medium flex items-center gap-1',
  processing:
    'bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium',
  draft:
    'bg-neutral-50 text-neutral-700 rounded-full px-3 py-1 text-xs font-medium',
};

// Default styling for unknown statuses
const DEFAULT_STATUS_CLASS =
  'bg-gray-50 text-gray-700 rounded-full px-3 py-1 text-xs font-medium';

const getStatusLabel = (status: PaymentRow['status']): string => {
  const normalized = String(status || 'processing').toLowerCase();
  return (
    STATUS_LABELS[normalized] ||
    // Capitalize first letter for unknown statuses
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  );
};

const getStatusClass = (status: PaymentRow['status']): string => {
  const normalized = String(status || 'processing').toLowerCase();
  return STATUS_CLASSES[normalized] || DEFAULT_STATUS_CLASS;
};

export const paymentsColumns: TableColumn<PaymentRow>[] = [
  {
    id: 'transactionDate',
    header: 'Transaction Date',
    accessor: 'transactionDate',
    cellClassName: 'text-sm font-medium text-black/80 min-w-[180px] truncate',
    minWidth: '180px',
    width: '200px',
  },
  {
    id: 'paymentId',
    header: 'Payment ID',
    accessor: 'paymentId',
    cellClassName: 'text-sm font-light text-black/70 truncate',
  },
  {
    id: 'invoice',
    header: 'Invoice',
    accessor: (row) => {
      if (!row.invoices || row.invoices.length === 0) {
        return <span className="text-sm text-black/40">—</span>;
      }

      const [firstInvoice, ...rest] = row.invoices;
      const moreCount = rest.length;

      return (
        <div className="inline-flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => handleViewInvoice(firstInvoice.invoiceId)}
            className="font-medium text-sky-700 hover:text-sky-800 hover:underline"
          >
            {firstInvoice.invoiceNumber || firstInvoice.invoiceId}
          </button>
          {moreCount > 0 && (
            <span className="group relative inline-flex">
              <button
                type="button"
                className="font-medium text-sky-700 hover:text-sky-800 hover:underline"
              >
                + {moreCount} more
              </button>
              <div className="pointer-events-none absolute bottom-5 right-0 z-20 mt-2 hidden -translate-y-1 opacity-0 transition-all duration-150 ease-in-out group-hover:block group-hover:translate-y-0 group-hover:opacity-100">
                <div className="pointer-events-auto rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
                  {row.invoices.map((invoice) => (
                    <button
                      key={invoice.invoiceId}
                      type="button"
                      onClick={() => handleViewInvoice(invoice.invoiceId)}
                      className="block cursor-pointer text-sky-700 hover:underline"
                    >
                      {invoice.invoiceNumber || invoice.invoiceId}
                    </button>
                  ))}
                </div>
                <div className="ml-auto mr-3 h-2 w-2 -translate-y-1 rotate-45 border-b border-l border-black/5 bg-white" />
              </div>
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: 'paymentMethod',
    header: 'Payment Mode',
    accessor: 'paymentMethod',
    cellClassName: 'text-sm font-normal text-black/60',
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => (
      <div className="flex items-center gap-1.5">
        <span className={getStatusClass(row.status)}>
          {getStatusLabel(row.status)}
        </span>
        {String(row.status).toLowerCase() === 'failed' && (
          <div className="group relative inline-flex">
            <button type="button" className="flex items-center justify-center">
              <SVG
                iconName="infoCircle"
                className="fill-orange-red stroke-orange-red h-6 w-6 stroke-[0.2]"
              />
            </button>
            <div className="pointer-events-none absolute bottom-5 right-0 z-20 mt-2 hidden -translate-y-1 opacity-0 transition-all duration-150 group-hover:block group-hover:translate-y-0 group-hover:opacity-100">
              <div className="pointer-events-auto max-w-sm overflow-hidden whitespace-normal break-words rounded-2xl border border-black/5 bg-white px-4 py-3 text-xs text-black/80 shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
                {row.failureReason ??
                  'Payment failed due to a technical issue. Please retry.'}
              </div>
              <div className="ml-auto mr-3 h-2 w-2 -translate-y-1 rotate-45 border-b border-l border-black/5 bg-white" />
            </div>
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'amount',
    header: 'Amount',
    accessor: 'amount',
    align: 'right',
    cellClassName: 'text-sm font-semibold text-black/80',
  },
];
