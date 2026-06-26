import { ProductLine } from './invoices';
import { PaymentItem } from './payments';

export interface BillingAndPaymentsTab {
  label: string;
  value: string;
}

export interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasProcessingPayment?: boolean;
  processingPayment?: PaymentItem | null;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  amount: number;
  currency: string;
  dueDate: string;
  productLine: ProductLine[];
}

export interface UpcomingPayment {
  totalDue: number;
  totalDueFormatted?: string;
  dueDate: string;
  invoicesCount: number;
  paymentMethod: string;
  lastPaymentAmount: number;
  lastPaymentDate: string;
  currency?: string;
}

export interface ProductPlanFeature {
  icon: string;
  label: string;
  logoUrl?: string;
}

export interface ProductPlan {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  planType: string;
  billingCycle: string;
  totalRooftops: number;
  pricing: number;
  features: ProductPlanFeature[];
}
