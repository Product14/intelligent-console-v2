import React, { useState } from 'react';
import { toast } from 'react-toastify';

import SVG from '@spyne-console/design-system/svg';

import { paymentsAPI } from '../api/payments';
import { UpcomingPayment } from '../types/common';
import { paymentStatusBannerConfig } from '../utils/config';

interface UpcomingPaymentCardProps {
  data: UpcomingPayment;
  onPayNow: () => void;
  onViewPayments?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
  isProcessing?: boolean;
  isSameCurrency?: boolean;
  hasProcessingPayment?: boolean;
  processingPaymentSessionUrl?: string;
  processingPaymentSessionId?: string;
  processingPaymentId?: string;
  paymentStatus?: 'success' | 'failure' | 'overdue' | null;
}

// Shimmer skeleton component
const UpcomingPaymentCardShimmer = () => {
  return (
    <div className="text-sm">
      {/* Title shimmer */}
      <div className="mb-2 h-5 w-40 animate-pulse rounded bg-gray-200"></div>

      <div className="rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm">
        {/* Total Due section shimmer */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-gray-50 px-6 py-5">
          <div className="flex-1">
            {/* "Total Due" label shimmer */}
            <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            {/* Amount shimmer */}
            <div className="flex items-baseline gap-1">
              <div className="h-12 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          {/* Button shimmer */}
          <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-200"></div>
        </div>

        {/* Invoices section shimmer */}
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="space-y-2">
            {[1].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UpcomingPaymentCard({
  data,
  onPayNow,
  onViewPayments,
  children,
  loading = false,
  isProcessing = false,
  isSameCurrency = true,
  hasProcessingPayment = false,
  processingPaymentSessionUrl,
  processingPaymentSessionId,
  processingPaymentId,
  paymentStatus = null,
}: UpcomingPaymentCardProps) {
  const [isCanceling, setIsCanceling] = useState(false);

  const handleContinuePayment = () => {
    if (processingPaymentSessionUrl) {
      window.open(processingPaymentSessionUrl, '_blank');
    }
  };

  const handleCancelPayment = async () => {
    if (!processingPaymentSessionId) return;

    try {
      setIsCanceling(true);

      // Extract enterprise_id from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const enterpriseId = urlParams.get('enterprise_id');

      const response = await paymentsAPI.cancelPaymentSession({
        sessionId: processingPaymentSessionId,
        ...(processingPaymentId && { paymentId: processingPaymentId }),
        ...(enterpriseId && { enterpriseId }),
      });

      if (response.error) {
        throw new Error(response.message || 'Failed to cancel payment session');
      }

      toast.success('Payment session canceled successfully');
    } catch (error) {
      console.error('Error canceling payment:', error);
      toast.error('Failed to cancel payment.');
    } finally {
      setIsCanceling(false);
    }
  };
  if (loading) {
    return <UpcomingPaymentCardShimmer />;
  }

  const hasInvoices = data.invoicesCount > 0;
  const canPayNow =
    hasInvoices && isSameCurrency && !isProcessing && !hasProcessingPayment;

  // Determine banner configuration based on payment status or processing state
  const bannerConfig = hasProcessingPayment
    ? paymentStatusBannerConfig.processing
    : paymentStatus && paymentStatusBannerConfig[paymentStatus]
      ? paymentStatusBannerConfig[paymentStatus]
      : null;

  return (
    <div className="text-sm">
      {/* for title */}
      <h3 className="mb-2 font-medium text-black/80">Upcoming Payment</h3>

      {/* Banner - Separate from container */}
      {bannerConfig && (
        <div className={`mb-3 rounded-2xl ${bannerConfig.bgColor} p-4`}>
          <div className="flex items-center gap-3">
            <SVG
              iconName={bannerConfig.icon}
              className={`h-5 w-5 ${bannerConfig.iconColor} ${hasProcessingPayment ? 'rotate-180 animate-spin' : ''}`}
            />
            <div className="flex-1">
              <p className={`text-sm font-medium ${bannerConfig.textColor}`}>
                {bannerConfig.title}
              </p>
              {hasProcessingPayment && (
                <p className={`text-xs ${bannerConfig.textColor}`}>
                  Go to the session by clicking{' '}
                  <button
                    onClick={handleContinuePayment}
                    disabled={!processingPaymentSessionUrl}
                    className="font-semibold underline hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>{' '}
                  or cancel the payment by clicking{' '}
                  <button
                    onClick={handleCancelPayment}
                    disabled={!processingPaymentSessionId || isCanceling}
                    className="font-semibold underline hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCanceling ? 'Canceling...' : 'Cancel'}
                  </button>
                </p>
              )}
              {!hasProcessingPayment && bannerConfig.description && (
                <p className={`text-xs ${bannerConfig.textColor}`}>
                  {bannerConfig.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm">
        {hasInvoices ? (
          <>
            {/* for total due and due date */}
            <div className="mb-4 rounded-2xl bg-gray-50 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-base font-bold text-neutral-900">
                    Total Due
                  </p>
                  <span className="flex items-baseline gap-1 text-5xl font-semibold">
                    {data.totalDueFormatted && (
                      <>
                        <span className="pr-2 text-black/40">
                          {data.totalDueFormatted.match(/^[^\d\s]+/)?.[0] ||
                            '$'}
                        </span>
                        <span className="text-black/80">
                          {data.totalDue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className="group relative items-center">
                  <button
                    onClick={onPayNow}
                    disabled={!canPayNow}
                    className={`rounded-xl px-20 py-4 text-lg font-semibold transition-colors ${
                      canPayNow && !hasProcessingPayment
                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                        : 'cursor-not-allowed bg-violet-600 text-white'
                    } ${hasProcessingPayment ? 'opacity-50' : ''} ${!hasInvoices || (!isSameCurrency && !hasProcessingPayment) ? 'bg-black/5 text-black/20' : ''}`}
                  >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </button>
                  {!isSameCurrency && hasInvoices && !hasProcessingPayment && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      All invoices must have the same currency
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                  {hasProcessingPayment && hasInvoices && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      A payment is currently being processed
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Invoices Section */}
            {children}
          </>
        ) : (
          <>
            {/* Empty State Card */}
            <div className="mb-6 rounded-2xl bg-gray-50 px-6 py-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="mb-2 text-xl font-bold text-neutral-900">
                    No Upcoming Payment
                  </h4>
                  <p className="text-sm font-normal text-black/60">
                    Your upcoming Invoices will be visible here. To view
                    previous Invoices, go to the "All Invoices" tab.
                  </p>
                </div>
                {onViewPayments && (
                  <button
                    onClick={onViewPayments}
                    className="ml-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    View All Invoices
                  </button>
                )}
              </div>
            </div>
            {/* Invoices Due Section will handle its own empty state */}
            {children}
          </>
        )}

        {/* for payment method and last payment */}
        {/* <div className="flex items-center gap-4 pt-4">
          <div className="border-r border-gray-200 pr-4">
            <span className="font-normal text-black/60">Payment Method: </span>
            <span className="font-medium text-black/80">
              {data.paymentMethod}
            </span>
          </div>
          <div>
            <span className="font-normal text-black/60">Last Payment: </span>
            <span className="font-medium text-black/80">
              ${data.lastPaymentAmount.toLocaleString()} on{' '}
              {data.lastPaymentDate}
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
