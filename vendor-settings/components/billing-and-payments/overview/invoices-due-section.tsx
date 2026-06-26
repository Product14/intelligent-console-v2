import React from 'react';

import SVG from '@spyne-console/design-system/svg';

import { Invoice } from '../types/common';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { handleViewInvoice } from '../utils/pdf';
import {
  getProductStyles,
  normalizeProductName,
} from '../utils/product-styles';

interface InvoicesDueSectionProps {
  invoices: Invoice[];
  isExpanded: boolean;
  onToggle: () => void;
  onPay: (invoiceId: string) => void;
  onView?: (invoiceUrl: string) => void;
  invoicesCount: number;
  currency?: string;
  processingInvoiceIds?: Set<string>;
  isBulkProcessing?: boolean;
  hasProcessingPayment?: boolean;
}

export default function InvoicesDueSection({
  invoices,
  isExpanded,
  onToggle,
  onPay,
  onView,
  invoicesCount,
  currency = 'USD',
  processingInvoiceIds = new Set(),
  isBulkProcessing = false,
  hasProcessingPayment = false,
}: InvoicesDueSectionProps) {
  if (invoicesCount === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
          0
        </span>
        <span className="text-sm font-normal text-black/60">Invoices Due</span>
      </div>
    );
  }
  return (
    <div
      className={`items-center overflow-hidden rounded-xl border border-gray-200 px-4 ${isExpanded ? 'pb-0 pt-3' : 'py-3'} text-sm text-black/80 shadow-sm`}
    >
      {/* Toggle Button */}
      <button onClick={onToggle} className="flex w-fit items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-xs font-semibold text-red-500">
          {invoicesCount}
        </span>
        Invoices Due
        <SVG
          iconName="downArrow"
          className={`h-2.5 w-2.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {/* Expandable Invoice List */}
      {isExpanded && (
        <div className="-mx-4 mt-2 border-t border-gray-200">
          {invoices.map((invoice, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-gray-200 px-4 py-2"
            >
              <button
                onClick={() => invoice.id && handleViewInvoice(invoice.id)}
                disabled={!invoice.id}
                className={`font-semibold text-sky-700 ${
                  invoice.id
                    ? 'cursor-pointer hover:underline'
                    : 'cursor-default'
                }`}
              >
                Invoice #{invoice.invoiceNumber || invoice.id}
              </button>
              <div className="flex items-center gap-8">
                <div className="flex flex-wrap gap-2">
                  {invoice.productLine && invoice.productLine.length > 0 ? (
                    invoice.productLine.map((product, index) => {
                      const productName = normalizeProductName(
                        product.displayName || 'Unknown'
                      );
                      const { bgColor, borderColor, textColor } =
                        getProductStyles(productName);
                      return (
                        <span
                          key={`${product._id}-${index}`}
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${bgColor} ${borderColor} ${textColor}`}
                        >
                          {productName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                      Unknown
                    </span>
                  )}
                </div>
                <span className="text-xs font-normal text-black/60">
                  {formatDate(invoice.dueDate)}
                </span>
                <span className="font-medium text-black/80">
                  {formatCurrency(invoice.amount, invoice?.currency || 'USD')}
                </span>
                <button
                  onClick={() => onPay(invoice.id)}
                  disabled={
                    processingInvoiceIds.has(invoice.id) ||
                    isBulkProcessing ||
                    hasProcessingPayment
                  }
                  className={`rounded-lg px-5 py-1 font-medium transition-colors ${
                    processingInvoiceIds.has(invoice.id) ||
                    isBulkProcessing ||
                    hasProcessingPayment
                      ? 'cursor-not-allowed bg-violet-600 text-white'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  } ${hasProcessingPayment || isBulkProcessing ? 'opacity-50' : ''}`}
                >
                  {processingInvoiceIds.has(invoice.id)
                    ? 'Processing...'
                    : isBulkProcessing
                      ? 'Processing...'
                      : 'Pay'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
