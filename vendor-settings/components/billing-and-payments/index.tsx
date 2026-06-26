import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import { useRouter } from 'next/router';

import { useQueryParams } from '@spyne-console/hooks';

import Header from './common/header';
import RedirectScreen from './common/redirect-screen';
import Tabs from './common/tabs';
import { usePaymentProcessingStatus } from './hooks/use-payment-processing-status';
import Invoices from './invoices';
import Overview from './overview';
import Payments from './payments';
import Refunds from './refunds';
import Usage from './usage';

export default function Index() {
  const router = useRouter();
  const { queryParams } = useQueryParams();
  const enterpriseId = queryParams.enterprise_id || '';
  const paymentStatus = queryParams.status;
  const [activeTab, setActiveTab] = useState('overview');
  const [showRedirectScreen, setShowRedirectScreen] = useState(!!paymentStatus);
  const [countdown, setCountdown] = useState(5);

  // Poll for processing payments only on overview and invoices tabs
  const shouldPoll = activeTab === 'overview' || activeTab === 'invoices';
  const { hasProcessingPayment, processingPayment } =
    usePaymentProcessingStatus({
      enterpriseId,
      pollingInterval: 5000, // 5 seconds
      enabled: shouldPoll,
    });

  // Handle redirect screen countdown and timer
  useEffect(() => {
    if (showRedirectScreen && paymentStatus) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setShowRedirectScreen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showRedirectScreen, paymentStatus]);

  // Initialize active tab from URL parameter
  useEffect(() => {
    const { selected_tab } = router.query;
    if (selected_tab && typeof selected_tab === 'string') {
      const validTabs = [
        'overview',
        'invoices',
        'payments',
        'refunds',
        // 'usage',
      ];
      if (validTabs.includes(selected_tab)) {
        setActiveTab(selected_tab);
      }
    }
  }, [router.query]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const currentQuery = { ...router.query };
    currentQuery.selected_tab = tab;
    router.push(
      {
        pathname: router.pathname,
        query: currentQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            hasProcessingPayment={hasProcessingPayment}
            processingPayment={processingPayment}
          />
        );
      case 'invoices':
        return <Invoices hasProcessingPayment={hasProcessingPayment} />;
      case 'payments':
        return <Payments />;
      case 'refunds':
        return <Refunds />;
      case 'usage':
        return <Usage />;
      default:
        return (
          <Overview
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            hasProcessingPayment={hasProcessingPayment}
            processingPayment={processingPayment}
          />
        );
    }
  };

  // Show redirect screen when status query param is present
  if (showRedirectScreen) {
    return (
      <RedirectScreen status={paymentStatus || ''} countdown={countdown} />
    );
  }

  return (
    <>
      <div className="min-h-screen w-full bg-gray-50 px-20 pb-5 pt-8">
        <Header />
        <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />
        <div className="mt-6">{renderTab()}</div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 999999 }}
      />
    </>
  );
}
