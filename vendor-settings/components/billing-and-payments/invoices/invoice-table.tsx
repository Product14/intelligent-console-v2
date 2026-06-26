import React, { useState } from 'react';

import SVG from '@spyne-console/design-system/svg';

import { InvoiceItem } from '../types/invoices';
import { invoiceStatusMap, invoiceTableColumns } from '../utils/config';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { handleDownloadInvoice, handleViewInvoice } from '../utils/pdf';
import {
  getProductStyles,
  normalizeProductName,
} from '../utils/product-styles';

interface InvoiceTableProps {
  invoices: InvoiceItem[];
  onPay: (invoiceId: string, invoice: InvoiceItem) => void;
  onView: (invoiceUrl: string) => void;
  onDownload: (invoiceUrl: string) => void;
  isProcessing?: boolean;
  hasProcessingPayment?: boolean;
}

const getStatusStyles = (status: string) => {
  const normalizedStatus = status.toLowerCase().trim();

  return (
    invoiceStatusMap[normalizedStatus] ||
    invoiceStatusMap[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: status,
    }
  );
};

export default function InvoiceTable({
  invoices,
  onPay,
  onView,
  onDownload,
  isProcessing = false,
  hasProcessingPayment = false,
}: InvoiceTableProps) {
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const onViewInvoice = async (invoiceId: string) => {
    setLoadingInvoiceId(invoiceId);
    await handleViewInvoice(invoiceId);
    setLoadingInvoiceId(null);
  };

  const onDownloadInvoice = async (
    invoiceId: string,
    invoiceNumber: string
  ) => {
    setLoadingInvoiceId(invoiceId);
    await handleDownloadInvoice(invoiceId, invoiceNumber);
    setLoadingInvoiceId(null);
  };
  return (
    <div className="h-[calc(100vh-290px)] overflow-auto rounded-b-lg rounded-t-none border border-black/10 bg-white">
      <table className="w-full border-collapse p-0">
        <thead className="sticky top-0 z-20">
          <tr className="border-b border-black/10 bg-gray-50">
            {invoiceTableColumns.map((column) => (
              <th
                key={column.key}
                className={`bg-gray-50 px-4 py-3 text-sm font-normal text-black/60 ${
                  column.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {invoices.map((invoice) => {
            const normalizedStatus = invoice.status?.toLowerCase().trim() || '';
            const statusStyle = getStatusStyles(invoice.status);
            const isOverdue =
              invoice.status === 'Overdue' || normalizedStatus === 'overdue';
            const shouldShowPayButton =
              invoice.status === 'Payment Due' ||
              invoice.status === 'Partially Paid' ||
              invoice.status === 'Overdue' ||
              normalizedStatus === 'payment_due' ||
              normalizedStatus === 'partially_paid' ||
              normalizedStatus === 'overdue';

            return (
              <tr
                key={invoice._id}
                className={`border-b border-gray-200 ${isOverdue ? 'bg-red-50/50' : ''}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg p-1 ${isOverdue ? 'bg-[#FFE8E8]' : 'bg-[#4600F20A]'}`}
                    >
                      <SVG
                        iconName="fileIcon"
                        className={`h-5 w-5`}
                        fill={isOverdue ? '#EF4444' : '#4600F2'}
                      />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-black/80">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="flex gap-2 text-xs font-medium">
                        <button
                          onClick={() => onViewInvoice(invoice.invoiceId)}
                          disabled={loadingInvoiceId === invoice.invoiceId}
                          className="text-sky-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            onDownloadInvoice(
                              invoice.invoiceId,
                              invoice.invoiceNumber
                            )
                          }
                          disabled={loadingInvoiceId === invoice.invoiceId}
                          className="text-sky-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                {/* <td className="px-4 py-3">
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
                </td> */}
                <td className="px-4 py-3 text-sm font-normal text-black/60">
                  {formatDate(invoice.raisedDate)}
                </td>
                <td className="px-4 py-3 text-sm font-normal text-black/60">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-left text-sm font-medium text-black/80">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </td>
                <td className="px-4 py-3 text-right">
                  {shouldShowPayButton ? (
                    <button
                      onClick={() => onPay(invoice.invoiceId, invoice)}
                      disabled={isProcessing || hasProcessingPayment}
                      className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-colors ${
                        isProcessing || hasProcessingPayment
                          ? 'cursor-not-allowed bg-violet-600 text-white'
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                      } ${hasProcessingPayment ? 'opacity-50' : ''}`}
                    >
                      {isProcessing ? 'Processing...' : 'Pay'}
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
