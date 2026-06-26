import { useEffect, useState } from 'react';

import { paymentsAPI } from '../api/payments';
import { PaymentItem } from '../types/payments';

interface UsePaymentProcessingStatusProps {
  enterpriseId: string;
  pollingInterval?: number; // in milliseconds, default 5000 (5 seconds)
  enabled?: boolean; // to enable/disable polling
}

/**
 * Custom hook to poll for processing payments
 * Returns true if any payment is in processing state
 */
export const usePaymentProcessingStatus = ({
  enterpriseId,
  pollingInterval = 5000,
  enabled = true,
}: UsePaymentProcessingStatusProps) => {
  const [hasProcessingPayment, setHasProcessingPayment] = useState(false);
  const [processingPayment, setProcessingPayment] =
    useState<PaymentItem | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!enterpriseId || !enabled) {
      setHasProcessingPayment(false);
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkProcessingPayments = async () => {
      try {
        setIsChecking(true);
        const response = await paymentsAPI.getPaymentDetails({
          enterpriseId,
          page: 0,
          limit: 10,
          filters: [
            {
              filterName: 'status',
              value: 'processing',
            },
          ],
        });

        // If we get any payments in the array, it means there's a processing payment
        const hasProcessing =
          !response.error &&
          response.data?.payments &&
          response.data.payments.length > 0;

        setHasProcessingPayment(hasProcessing);
        setProcessingPayment(hasProcessing ? response.data.payments[0] : null);
      } catch (error) {
        console.error('Error checking payment processing status:', error);
        // On error, set to false to not block payments
        setHasProcessingPayment(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkProcessingPayments();

    // Set up polling
    intervalId = setInterval(checkProcessingPayments, pollingInterval);

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enterpriseId, pollingInterval, enabled]);

  return {
    hasProcessingPayment,
    processingPayment,
    isChecking,
  };
};
