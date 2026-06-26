import { BillingAndPaymentsTab } from '../types/common';
import { InvoiceStatus } from '../types/invoices';

export const billingAndPaymentsTabs: BillingAndPaymentsTab[] = [
  {
    label: 'Overview',
    value: 'overview',
  },
  {
    label: 'All Invoices',
    value: 'invoices',
  },
  // {
  //   label: 'Usage',
  //   value: 'usage',
  // },
  {
    label: 'Payments',
    value: 'payments',
  },
  {
    label: 'Refunds',
    value: 'refunds',
  },
];

// Color configurations for product cards
export const productColors = {
  studioAI: 'bg-blue-500',
  viniAI: 'bg-purple-500',
};

// Status colors
export const statusColors = {
  due: 'bg-red-50 text-red-600',
  paid: 'bg-green-50 text-green-600',
  pending: 'bg-yellow-50 text-yellow-600',
};

// Invoice status options for filters
export const invoiceStatusOptions: Array<{
  value: InvoiceStatus;
  label: string;
}> = [
  { value: 'payment_due', label: 'Payment Due' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
];

// Mapping from backend status (PascalCase) to filter value (snake_case)
export const backendStatusToFilterMap: Record<string, InvoiceStatus> = {
  'Payment Due': 'payment_due',
  'Partially Paid': 'partially_paid',
  Overdue: 'overdue',
  Paid: 'paid',
  Void: 'void',
};

// Mapping from filter value (snake_case) to backend status (PascalCase)
export const filterToBackendStatusMap: Record<InvoiceStatus, string> = {
  payment_due: 'Payment Due',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  paid: 'Paid',
  void: 'Void',
};

export const paymentStatusOptions = [
  { value: 'successful', label: 'Successful' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
];

// Invoice status styles map for table display
// Handles both backend PascalCase values and filter snake_case values
export const invoiceStatusMap: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  // Backend PascalCase values
  'Payment Due': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: 'Payment Due',
  },
  'Partially Paid': {
    bg: 'bg-lime-100',
    text: 'text-lime-700',
    label: 'Partially Paid',
  },
  Overdue: { bg: 'bg-red-700', text: 'text-white', label: 'Overdue' },
  Paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
  Void: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Void' },
};

// Invoice table column configuration
export interface InvoiceTableColumn {
  key: string;
  label: string;
  align: 'left' | 'right';
}

export const invoiceTableColumns: InvoiceTableColumn[] = [
  { key: 'invoiceId', label: 'Invoice ID', align: 'left' },
  // { key: 'product', label: 'Product', align: 'left' },
  { key: 'raisedOn', label: 'Raised On', align: 'left' },
  { key: 'dueOn', label: 'Due On', align: 'left' },
  { key: 'status', label: 'Status', align: 'left' },
  { key: 'amount', label: 'Amount', align: 'left' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

// Product icon and label mapping
export const productIconMap: Record<string, { icon: string; label: string }> = {
  image: { icon: 'VideoIcon', label: 'Image' },
  video: { icon: 'VideoIcon', label: 'Video tour' },
  threeSixty: { icon: '360Icon', label: '360° Spin' },
  inboundService: { icon: 'ServiceIcon', label: 'Inbound Service' },
  outboundService: { icon: 'ServiceIcon', label: 'Outbound Service' },
  inboundSales: { icon: 'SalesIcon', label: 'Inbound Sales' },
  outboundSales: { icon: 'SalesIcon', label: 'Outbound Sales' },
};

// Helper function to get product icon and label
export const getProductIconAndLabel = (
  product: string
): { icon: string; label: string } => {
  return (
    productIconMap[product.toLowerCase()] || {
      icon: 'VideoIcon',
      label: product.charAt(0).toUpperCase() + product.slice(1),
    }
  );
};

// Billing cycle mapping
export const billingCycleMap: Record<number, string> = {
  1: 'Monthly',
  3: 'Quarterly',
  6: 'Half-yearly',
  12: 'Annual',
};

// Payment status banner configuration
export const paymentStatusBannerConfig = {
  processing: {
    icon: 'orangeProcessingIcon',
    iconColor: 'text-yellow-500',
    bgColor: '!bg-amber-50',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-500',
    title: 'Waiting for payment completion on the payment gateway',
    description: '', // Will be rendered as JSX with clickable links
  },
  success: {
    icon: 'statusInfo',
    iconColor: 'text-green-600',
    bgColor: '!bg-green-100',
    borderColor: 'border-green-600',
    textColor: 'text-green-600',
    title: 'Your payment was successful. Enjoy your services',
    description: '',
  },
  failure: {
    icon: 'statusInfo',
    iconColor: 'text-red-600',
    bgColor: '!bg-red-100',
    borderColor: 'border-red-600',
    textColor: 'text-red-600',
    title: 'Your payment could not be completed. Please try again.',
    description: '',
  },
  overdue: {
    icon: 'statusInfo',
    iconColor: 'text-red-600',
    bgColor: '!bg-red-100',
    borderColor: 'border-red-600',
    textColor: 'text-red-600',
    title: 'Your payment is overdue. Pay now to avoid interruption of services',
    description: '',
  },
};
