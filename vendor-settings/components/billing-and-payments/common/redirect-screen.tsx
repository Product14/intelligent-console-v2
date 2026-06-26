import React, { useEffect, useState } from 'react';

interface RedirectScreenProps {
  status: 'success' | 'failure' | string;
  countdown: number;
}

export default function RedirectScreen({
  status,
  countdown,
}: RedirectScreenProps) {
  const isSuccess = status === 'success';
  const isFailure = status === 'failure';

  const [paymentAmount, setPaymentAmount] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    // Extract URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('payment_amount');
    const paymentId = urlParams.get('payment_id');

    if (amount) {
      setPaymentAmount(amount);
    }
    if (paymentId) {
      setTransactionId(paymentId);
    }
  }, []);

  // Calculate progress percentage (assuming countdown starts at 5)
  const totalTime = 5;
  const progressPercentage = ((totalTime - countdown) / totalTime) * 100;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="mb-6 flex justify-center">
          {isSuccess && (
            <img
              src="https://spyne-static.s3.us-east-1.amazonaws.com/gsap-homepage/thank-you-page.gif"
              alt="Success"
              className="h-64 w-64 object-contain"
            />
          )}

          {isFailure && (
            <img
              src="https://spyne-static.s3.us-east-1.amazonaws.com/console/admin-tools/cross.gif"
              alt="Failed"
              className="h-64 w-64 object-contain"
            />
          )}

          {!isSuccess && !isFailure && (
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600"></div>
          )}
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
          {isSuccess && 'Payment Successful!'}
          {isFailure && 'Payment Failed'}
          {!isSuccess && !isFailure && 'Redirecting you to Billing and Plans'}
        </h2>

        {/* Payment Details */}
        {(isSuccess || isFailure) && (paymentAmount || transactionId) && (
          <div className="mx-auto mb-4 mt-6 max-w-2xl space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-6">
            {paymentAmount && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {isSuccess ? 'Amount Paid:' : 'Amount:'}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {parseFloat(paymentAmount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {transactionId && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-600">
                  Transaction ID:
                </span>
                <span className="break-all font-mono text-xs text-gray-700">
                  {transactionId}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-lg text-gray-600">
          {isSuccess && 'Redirecting you to your billing dashboard...'}
          {isFailure && 'Redirecting you back to try again...'}
          {!isSuccess && !isFailure && `Please wait ${countdown} seconds...`}
        </p>

        {/* Countdown */}
        <p className="mt-2 text-sm text-gray-500">{countdown}s</p>

        {/* Progress Bar */}
        <div className="mx-auto mt-6 w-64 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-violet-600 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
