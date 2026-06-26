import { toast } from 'react-toastify';

import { invoicesAPI } from '../api/invoices';
import { refundsAPI } from '../api/refunds';

/**
 * Converts base64 string to a Blob
 */
export const base64ToBlob = (
  base64: string,
  contentType = 'application/pdf'
): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

/**
 * Downloads a PDF from base64 string
 */
export const downloadPdfFromBase64 = (
  base64: string,
  filename: string
): void => {
  const blob = base64ToBlob(base64);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Opens a PDF in a new tab from base64 string
 */
export const viewPdfFromBase64 = (base64: string): void => {
  const blob = base64ToBlob(base64);
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');

  // Clean up after a delay to ensure the PDF loads
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Fetches invoice PDF from API
 */
export const fetchInvoicePdf = async (
  invoiceId: string
): Promise<{ pdf: string; invoiceNumber: string }> => {
  const response = await invoicesAPI.getInvoicePdf({
    invoiceId,
  });

  if (response.error) {
    throw new Error(response.message || 'Failed to fetch invoice PDF');
  }

  return {
    pdf: response.data.pdf,
    invoiceNumber: response.data.invoiceNumber,
  };
};

/**
 * Fetches credit note PDF from API
 */
export const fetchCreditNotePdf = async (
  creditnoteId: string
): Promise<{ pdf: string; creditnoteNumber: string }> => {
  const response = await refundsAPI.getCreditNotePdf({
    creditnoteId,
  });

  if (response.error) {
    throw new Error(response.message || 'Failed to fetch credit note PDF');
  }

  return {
    pdf: response.data.pdf,
    creditnoteNumber: response.data.creditnoteNumber,
  };
};

/**
 * Common handler to view invoice PDF
 */
export const handleViewInvoice = async (invoiceId: string): Promise<void> => {
  try {
    const response = await invoicesAPI.getInvoicePdf({ invoiceId });
    if (response.error) {
      throw new Error(response.message || 'Failed to fetch invoice PDF');
    }
    viewPdfFromBase64(response.data.pdf);
  } catch (error) {
    console.error('Error viewing invoice:', error);
    toast.error(
      error instanceof Error ? error.message : 'Failed to view invoice.'
    );
  }
};

/**
 * Common handler to download invoice PDF
 */
export const handleDownloadInvoice = async (
  invoiceId: string,
  invoiceNumber: string
): Promise<void> => {
  try {
    const { pdf, invoiceNumber: fetchedInvoiceNumber } =
      await fetchInvoicePdf(invoiceId);
    const filename = `${fetchedInvoiceNumber || invoiceNumber}.pdf`;
    downloadPdfFromBase64(pdf, filename);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    toast.error(
      error instanceof Error ? error.message : 'Failed to download invoice.'
    );
  }
};

/**
 * Common handler to view credit note PDF
 */
export const handleViewCreditNote = async (
  creditnoteId: string
): Promise<void> => {
  try {
    const { pdf } = await fetchCreditNotePdf(creditnoteId);
    viewPdfFromBase64(pdf);
  } catch (error) {
    console.error('Error viewing credit note:', error);
    toast.error(
      error instanceof Error ? error.message : 'Failed to view credit note.'
    );
  }
};

/**
 * Common handler to download credit note PDF
 */
export const handleDownloadCreditNote = async (
  creditnoteId: string,
  creditnoteNumber: string
): Promise<void> => {
  try {
    const { pdf, creditnoteNumber: fetchedCreditnoteNumber } =
      await fetchCreditNotePdf(creditnoteId);
    const filename = `${fetchedCreditnoteNumber || creditnoteNumber}.pdf`;
    downloadPdfFromBase64(pdf, filename);
  } catch (error) {
    console.error('Error downloading credit note:', error);
    toast.error(
      error instanceof Error ? error.message : 'Failed to download credit note.'
    );
  }
};
