import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import SVG from '@spyne-console/design-system/svg';

import { useQueryParams } from '@spyne-console/hooks';

import { planDetailsAPI } from '../api/get-plan-details';
import { invoicesAPI } from '../api/invoices';
import ProductPlanCard from '../common/product-plan-card';
import { usePayment } from '../hooks/use-payment';
import {
  Invoice,
  ProductPlan,
  ProductPlanFeature,
  TabsProps,
} from '../types/common';
import { InvoiceItem } from '../types/invoices';
import { PlanDetailsItem } from '../types/plan-details';
import { billingCycleMap, getProductIconAndLabel } from '../utils/config';
import { formatCurrency } from '../utils/currency';
import { normalizeProductName } from '../utils/product-styles';
import InvoicesDueSection from './invoices-due-section';
import UpcomingPaymentCard from './upcoming-payment-card';

// Map API product type keys to display names
const getProductDisplayName = (productTypeKey: string): string => {
  const productNameMap: Record<string, string> = {
    studioAi: 'Studio AI',
    conversationalAi: 'Vini AI',
  };

  // Convert camelCase to Title Case if not in map
  if (productNameMap[productTypeKey]) {
    return productNameMap[productTypeKey];
  }

  // Fallback: default to Studio AI for unknown product types
  return 'Studio AI';
};

// Get icon for product type
const getProductIcon = (productName: string): string => {
  const iconMap: Record<string, string> = {
    'Studio AI': 'VideoIcon',
    'Vini AI': 'AgentIcon',
  };
  // Default to Studio AI icon for unknown product types
  return iconMap[productName] || 'VideoIcon';
};

// Get icon color for product type
const getProductIconColor = (productName: string): string => {
  const colorMap: Record<string, string> = {
    'Studio AI': 'bg-blue-500',
    'Vini AI': 'bg-purple-500',
  };
  // Default to Studio AI color for unknown product types
  return colorMap[productName] || 'bg-blue-500';
};

// Transform API response to ProductPlan format
const transformPlanDetailsToProductPlan = (
  item: PlanDetailsItem,
  productName: string,
  index: number
): ProductPlan => {
  const features: ProductPlanFeature[] = item.product.map((product) => {
    const { icon } = getProductIconAndLabel(product.name);
    return {
      icon,
      label: product.displayName,
      logoUrl: product.displayLogoUrl,
    };
  });

  return {
    id: `${productName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: productName,
    icon: getProductIcon(productName),
    iconColor: getProductIconColor(productName),
    planType: item.plan,
    billingCycle: billingCycleMap[item.billing] || '-',
    totalRooftops: item.totalRooftops,
    pricing: item.pricing,
    features,
  };
};

interface ProductPlansState {
  [productType: string]: ProductPlan[];
}

interface ProductIndicesState {
  [productType: string]: number;
}

export default function Overview({
  activeTab,
  setActiveTab,
  hasProcessingPayment = false,
  processingPayment,
}: TabsProps) {
  const router = useRouter();
  const { queryParams } = useQueryParams();
  const enterpriseId = queryParams.enterprise_id || '';
  const paymentStatus = queryParams.status as
    | 'success'
    | 'failure'
    | 'overdue'
    | undefined;
  const [isInvoicesExpanded, setIsInvoicesExpanded] = useState(false);
  const [productPlans, setProductPlans] = useState<ProductPlansState>({});
  const [productIndices, setProductIndices] = useState<ProductIndicesState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dueInvoices, setDueInvoices] = useState<Invoice[]>([]);
  const [rawDueInvoices, setRawDueInvoices] = useState<InvoiceItem[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [currency, setCurrency] = useState<string>('USD');
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isSameCurrency, setIsSameCurrency] = useState(true);
  const [displayPaymentStatus, setDisplayPaymentStatus] = useState<
    'success' | 'failure' | 'overdue' | null
  >(paymentStatus || null);
  const [processingInvoiceIds, setProcessingInvoiceIds] = useState<Set<string>>(
    new Set()
  );
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Payment hook
  const { isProcessing, paySingleInvoice, payBulkInvoices, validateCurrency } =
    usePayment({
      enterpriseId,
      onSuccess: () => {
        // Refetch invoices after successful payment
        fetchDueInvoices();
        setProcessingInvoiceIds(new Set());
        setIsBulkProcessing(false);
      },
      onError: (error) => {
        alert(`Payment failed: ${error}`);
        setProcessingInvoiceIds(new Set());
        setIsBulkProcessing(false);
      },
    });

  // Remove status parameter from URL after banner is shown
  useEffect(() => {
    if (paymentStatus && displayPaymentStatus) {
      // Wait a bit to ensure banner is rendered, then remove status from URL
      const timer = setTimeout(() => {
        const currentQuery = { ...router.query };
        delete currentQuery.status;
        router.replace(
          {
            pathname: router.pathname,
            query: currentQuery,
          },
          undefined,
          { shallow: true }
        );
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, displayPaymentStatus, router]);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!enterpriseId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await planDetailsAPI.getPlanDetails({ enterpriseId });

        if (response.error) {
          setError(response.message || 'Failed to fetch plan details');
          setProductPlans({});
          setProductIndices({});
        } else {
          const plansByProduct: ProductPlansState = {};
          const indicesByProduct: ProductIndicesState = {};

          // Dynamically process all product types in the response
          Object.entries(response.data).forEach(([productTypeKey, items]) => {
            if (Array.isArray(items) && items.length > 0) {
              const productName = getProductDisplayName(productTypeKey);
              const transformedPlans: ProductPlan[] = (
                items as PlanDetailsItem[]
              ).map((item: PlanDetailsItem, index: number) =>
                transformPlanDetailsToProductPlan(item, productName, index)
              );
              plansByProduct[productTypeKey] = transformedPlans;
              indicesByProduct[productTypeKey] = 0;
            }
          });

          setProductPlans(plansByProduct);
          setProductIndices(indicesByProduct);
        }
      } catch (err: any) {
        setError(
          err?.message || 'An error occurred while fetching plan details'
        );
        setProductPlans({});
        setProductIndices({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanDetails();
  }, [enterpriseId]);

  // Fetch due invoices
  const fetchDueInvoices = async () => {
    if (!enterpriseId) {
      setDueInvoices([]);
      setRawDueInvoices([]);
      setTotalDue(0);
      setIsSameCurrency(true);
      return;
    }

    setIsLoadingInvoices(true);

    try {
      const response = await invoicesAPI.getInvoices({
        enterpriseId,
        page: 0,
        limit: 100,
        filters: [
          {
            filterName: 'status',
            value: ['payment_due', 'partially_paid', 'overdue'],
          },
        ],
      });

      if (response.error) {
        setDueInvoices([]);
        setRawDueInvoices([]);
        setTotalDue(0);
        setCurrency('USD');
        setIsSameCurrency(true);
      } else {
        // Store raw invoices for payment processing
        setRawDueInvoices(response.data.invoices);

        // Transform InvoiceItem[] to Invoice[]
        const transformedInvoices: Invoice[] = response.data.invoices.map(
          (item: InvoiceItem) => ({
            id: item.invoiceId,
            invoiceNumber: item.invoiceNumber,
            invoiceUrl: item.invoiceUrl,
            amount: item.totalAmount,
            dueDate: item.dueDate,
            currency: item.currency,
            productLine: item.productLine || [],
          })
        );

        // Calculate total due (sum of all invoice amounts)
        const total = response.data.invoices.reduce(
          (sum: number, invoice: InvoiceItem) => sum + invoice.totalAmount,
          0
        );

        // Get currency from first invoice (assuming all invoices have same currency)
        const invoiceCurrency =
          response.data.invoices.length > 0
            ? response.data.invoices[0].currency
            : 'USD';

        // Validate if all invoices have same currency
        const currencyValidation = validateCurrency(response.data.invoices);
        setIsSameCurrency(currencyValidation.isValid);

        setDueInvoices(transformedInvoices);
        setTotalDue(total);
        setCurrency(invoiceCurrency);
      }
    } catch (err: any) {
      console.error('Failed to fetch due invoices:', err);
      setDueInvoices([]);
      setRawDueInvoices([]);
      setTotalDue(0);
      setCurrency('USD');
      setIsSameCurrency(true);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchDueInvoices();
  }, [enterpriseId]);

  const handlePayNow = async () => {
    if (!isSameCurrency) {
      alert(
        'Cannot process bulk payment: All invoices must have the same currency'
      );
      return;
    }

    if (rawDueInvoices.length === 0) {
      alert('No invoices available for payment');
      return;
    }

    setIsBulkProcessing(true);
    await payBulkInvoices(rawDueInvoices, currency);
  };

  const handleToggleInvoices = () => {
    setIsInvoicesExpanded(!isInvoicesExpanded);
  };

  const handleInvoicePay = async (invoiceId: string) => {
    // Find the invoice from raw invoices
    const invoice = rawDueInvoices.find((inv) => inv.invoiceId === invoiceId);

    if (!invoice) {
      alert('Invoice not found');
      return;
    }

    setProcessingInvoiceIds((prev) => new Set(prev).add(invoiceId));
    await paySingleInvoice(invoice, invoice.currency);
  };

  const handleInvoiceView = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  const handleProductMoreDetails = (productId: string) => {
    window.open(`https://www.spyne.ai/pricing`, '_blank');
  };

  const handlePrevious = (productType: string, plans: ProductPlan[]) => {
    setProductIndices((prev) => ({
      ...prev,
      [productType]:
        prev[productType] === 0 ? plans.length - 1 : prev[productType] - 1,
    }));
  };

  const handleNext = (productType: string, plans: ProductPlan[]) => {
    setProductIndices((prev) => ({
      ...prev,
      [productType]:
        prev[productType] === plans.length - 1 ? 0 : prev[productType] + 1,
    }));
  };

  const renderStackedCard = (
    plans: ProductPlan[],
    currentIndex: number,
    onPrevious: () => void,
    onNext: () => void
  ) => {
    if (plans.length === 0) {
      return (
        <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">No plans available</p>
        </div>
      );
    }

    const hasMultiplePlans = plans.length > 1;

    return (
      <div className="group relative overflow-hidden">
        {/* Card Container with Slide Animation */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {plans.map((plan) => (
            <div key={plan.id} className="min-w-full flex-shrink-0">
              <ProductPlanCard
                plan={plan}
                onMoreDetails={() => handleProductMoreDetails(plan.id)}
              />
            </div>
          ))}
        </div>
        {hasMultiplePlans && (
          <>
            {/* Left Arrow */}
            <button
              onClick={onPrevious}
              className="absolute left-0 top-1/2 z-10 flex h-full w-[10%] -translate-y-1/2 items-center justify-center rounded-l-lg rounded-r-none bg-gradient-to-r from-black/10 via-black/5 to-transparent opacity-0 transition-all group-hover:opacity-100"
              aria-label="Previous card"
            >
              <SVG iconName="BackIcon" className="h-7 w-7 text-gray-700" />
            </button>
            {/* Right Arrow */}
            <button
              onClick={onNext}
              className="absolute right-0 top-1/2 z-10 flex h-full w-[10%] -translate-y-1/2 items-center justify-center rounded-l-none rounded-r-lg bg-gradient-to-l from-black/10 via-black/5 to-transparent opacity-0 transition-all group-hover:opacity-100"
              aria-label="Next card"
            >
              <SVG
                iconName="BackIcon"
                className="h-7 w-7 rotate-180 text-gray-700"
              />
            </button>
            {/* Card Counter - Always visible */}
            <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/50 px-2 py-0.5">
              <span className="text-[10px] font-medium text-white">
                {currentIndex + 1} / {plans.length}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  // Calculate upcoming payment data from API
  const upcomingPaymentDataFromAPI = {
    totalDue,
    totalDueFormatted: formatCurrency(totalDue, currency),
    dueDate: dueInvoices.length > 0 ? dueInvoices[0].dueDate : '',
    invoicesCount: dueInvoices.length,
    paymentMethod: 'Not configured',
    lastPaymentAmount: 0,
    lastPaymentDate: 'N/A',
    currency,
  };

  const handleViewPayments = () => {
    setActiveTab('invoices');
  };

  return (
    <div className="space-y-6">
      <UpcomingPaymentCard
        data={upcomingPaymentDataFromAPI}
        onPayNow={handlePayNow}
        onViewPayments={handleViewPayments}
        loading={isLoadingInvoices}
        isProcessing={isBulkProcessing}
        isSameCurrency={isSameCurrency}
        hasProcessingPayment={hasProcessingPayment}
        processingPaymentSessionUrl={processingPayment?.sessionUrl}
        processingPaymentSessionId={processingPayment?.sessionId}
        processingPaymentId={processingPayment?.paymentId}
        paymentStatus={displayPaymentStatus}
      >
        <InvoicesDueSection
          invoices={dueInvoices}
          isExpanded={isInvoicesExpanded}
          onToggle={handleToggleInvoices}
          onPay={handleInvoicePay}
          onView={handleInvoiceView}
          invoicesCount={dueInvoices.length}
          currency={currency}
          processingInvoiceIds={processingInvoiceIds}
          isBulkProcessing={isBulkProcessing}
          hasProcessingPayment={hasProcessingPayment}
        />
      </UpcomingPaymentCard>

      {/* Products and Plans Section */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-black/80">
          Products and Plans
        </h3>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading plans...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : Object.keys(productPlans).length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No plans available
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Object.entries(productPlans).map(([productType, plans]) => (
              <div key={productType}>
                {renderStackedCard(
                  plans,
                  productIndices[productType] || 0,
                  () => handlePrevious(productType, plans),
                  () => handleNext(productType, plans)
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
