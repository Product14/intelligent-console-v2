import { useState } from 'react';

import {
  CreatePaymentParams,
  PaymentInvoice,
  paymentAPI,
} from '../api/create-payment';
import { Invoice } from '../types/common';
import { InvoiceItem } from '../types/invoices';

interface UsePaymentProps {
  enterpriseId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PaymentResult {
  success: boolean;
  error?: string;
  checkoutUrl?: string;
}

export const usePayment = ({
  enterpriseId,
  onSuccess,
  onError,
}: UsePaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Process payment for single or multiple invoices
   */
  const processPayment = async (
    invoices: Invoice[] | InvoiceItem[],
    currency: string
  ): Promise<PaymentResult> => {
    if (!enterpriseId) {
      const error = 'Enterprise ID is required';
      onError?.(error);
      return { success: false, error };
    }

    if (!invoices || invoices.length === 0) {
      const error = 'No invoices selected for payment';
      onError?.(error);
      return { success: false, error };
    }

    setIsProcessing(true);

    try {
      // Transform invoices to payment format
      const paymentInvoices: PaymentInvoice[] = invoices.map((invoice) => {
        // Handle both Invoice and InvoiceItem types
        const isInvoiceItem = 'invoiceId' in invoice;
        return {
          invoiceId: isInvoiceItem
            ? (invoice as InvoiceItem).invoiceId
            : (invoice as Invoice).id,
          invoiceNumber: invoice.invoiceNumber || '',
          amount: isInvoiceItem
            ? (invoice as InvoiceItem).totalAmount
            : (invoice as Invoice).amount,
        };
      });

      // Calculate total amount
      const totalAmount = paymentInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      // Prepare payment params
      const params: CreatePaymentParams = {
        invoices: paymentInvoices,
        totalAmount,
        currency,
        enterpriseId,
      };

      // Call payment API
      const response = await paymentAPI.createPayment(params);

      if (response.error) {
        const error = response.message || 'Payment creation failed';
        onError?.(error);
        return { success: false, error };
      }

      // Open checkout URL in new tab
      if (response.data?.checkoutSession) {
        window.open(response.data.checkoutSession, '_blank');
        onSuccess?.();
        return {
          success: true,
          checkoutUrl: response.data.checkoutSession,
        };
      }

      const error = 'No checkout URL received';
      onError?.(error);
      return { success: false, error };
    } catch (error: any) {
      const errorMessage =
        error?.message || 'An error occurred while processing payment';
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Process payment for a single invoice
   */
  const paySingleInvoice = async (
    invoice: Invoice | InvoiceItem,
    currency: string
  ): Promise<PaymentResult> => {
    // Determine if it's an Invoice or InvoiceItem and pass as appropriate array type
    const isInvoiceItem = 'invoiceId' in invoice;
    return isInvoiceItem
      ? processPayment([invoice as InvoiceItem], currency)
      : processPayment([invoice as Invoice], currency);
  };

  /**
   * Process bulk payment for multiple invoices
   */
  const payBulkInvoices = async (
    invoices: Invoice[] | InvoiceItem[],
    currency: string
  ): Promise<PaymentResult> => {
    return processPayment(invoices, currency);
  };

  /**
   * Validate if all invoices have the same currency
   */
  const validateCurrency = (
    invoices: InvoiceItem[]
  ): { isValid: boolean; currency?: string; error?: string } => {
    if (!invoices || invoices.length === 0) {
      return { isValid: false, error: 'No invoices provided' };
    }

    const currencies = new Set(invoices.map((inv) => inv.currency));

    if (currencies.size > 1) {
      return {
        isValid: false,
        error: 'All invoices must have the same currency for bulk payment',
      };
    }

    return { isValid: true, currency: invoices[0].currency };
  };

  return {
    isProcessing,
    paySingleInvoice,
    payBulkInvoices,
    validateCurrency,
  };
};
