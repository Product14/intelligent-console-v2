import React from 'react';

import SvgIcon from '@spyne-console/design-system/svg';

import { TableColumn } from '../table-structure/types';
import { RefundInvoice } from '../types/refunds';
import {
  handleDownloadCreditNote,
  handleViewCreditNote,
  handleViewInvoice,
} from '../utils/pdf';

type RefundProduct = 'studioAi' | 'viniAi';

type RefundStatus = 'pending' | 'processed' | 'void';

export interface RefundRow {
  id: string;
  creditNoteId: string;
  products: RefundProduct[];
  invoices: string[];
  raisedOn: string;
  status: RefundStatus;
  creditAmount: string;
  currency?: string;
  invoiceDetails?: RefundInvoice[];
}

const PRODUCT_LABELS: Record<RefundProduct, string> = {
  studioAi: 'Studio AI',
  viniAi: 'Vini AI',
};

const PRODUCT_CLASSES: Record<RefundProduct, string> = {
  studioAi:
    'bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-xs font-medium',
  viniAi:
    'bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-3 py-1 text-xs font-medium',
};

const STATUS_LABELS: Record<RefundStatus, string> = {
  pending: 'Pending',
  processed: 'Processed',
  void: 'Void',
};

const STATUS_CLASSES: Record<RefundStatus, string> = {
  pending:
    'bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium',
  processed:
    'bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-xs font-medium',
  void: 'bg-neutral-100 text-neutral-600 rounded-full px-3 py-1 text-xs',
};

export const refundsColumns: TableColumn<RefundRow>[] = [
  {
    id: 'creditNoteId',
    header: 'Credit Note ID',
    accessor: (row) => (
      <div className="flex items-center gap-3">
        <div className="bg-blue-4 rounded-lg p-1">
          <SvgIcon
            iconName="descriptionIcon"
            className="fill-blue-dark h-5 w-5 opacity-80"
          />
        </div>
        <div className="">
          <span className="text-sm font-semibold text-black/80">
            {row.creditNoteId}
          </span>
          <div className="flex gap-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleViewCreditNote(row.id)}
              className="border-r border-black/10 pr-1 text-sky-700 hover:text-sky-800 hover:underline"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => handleDownloadCreditNote(row.id, row.creditNoteId)}
              className="text-sky-700 hover:text-sky-800 hover:underline"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    ),
    cellClassName: 'text-sm font-normal text-black/60 truncate',
    minWidth: '350px',
    width: '350px',
  },
  // {
  //   id: 'product',
  //   header: 'Product',
  //   accessor: (row) => {
  //     if (!row.products || row.products.length === 0) {
  //       return <span className="text-sm text-black/40">—</span>;
  //     }

  //     return (
  //       <div className="flex flex-wrap items-center gap-1.5">
  //         {row.products.map((product, idx) => (
  //           <span
  //             key={`${product}-${idx}`}
  //             className={PRODUCT_CLASSES[product]}
  //           >
  //             {PRODUCT_LABELS[product]}
  //           </span>
  //         ))}
  //       </div>
  //     );
  //   },
  //   align: 'left',
  // },
  {
    id: 'usedAgainst',
    header: 'Used Against',
    align: 'left',
    accessor: (row) => {
      if (!row.invoices || row.invoices.length === 0) {
        return <span className="text-sm text-black/40">—</span>;
      }

      const [firstInvoice, ...rest] = row.invoices;
      const moreCount = rest.length;

      // Get invoice details if available
      const firstInvoiceDetail = row.invoiceDetails?.[0];
      const invoiceUrl = firstInvoiceDetail?.invoiceUrl;

      return (
        <div className="inline-flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() =>
              firstInvoiceDetail?.invoiceId &&
              handleViewInvoice(firstInvoiceDetail.invoiceId)
            }
            className="font-medium text-sky-700 hover:text-sky-800 hover:underline"
          >
            {firstInvoice}
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
                  {row.invoiceDetails?.map((invoice, idx) => (
                    <button
                      key={invoice.invoiceId}
                      type="button"
                      onClick={() => handleViewInvoice(invoice.invoiceId)}
                      className="block cursor-pointer text-sky-700 hover:underline"
                    >
                      {row.invoices[idx]}
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
    id: 'raisedOn',
    header: 'Raised On',
    accessor: 'raisedOn',
    cellClassName: 'text-sm font-normal text-black/60',
    align: 'left',
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => (
      <span className={STATUS_CLASSES[row.status]}>
        {STATUS_LABELS[row.status]}
      </span>
    ),
    align: 'left',
  },
  {
    id: 'creditAmount',
    header: 'Credit Amount',
    accessor: 'creditAmount',
    cellClassName: 'text-sm font-medium text-black/80',
    align: 'right',
  },
];
