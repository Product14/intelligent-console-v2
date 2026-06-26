import React from 'react';

import Spinner from '@spyne-console/design-system/spinner';

import { IntegrationsProvider, useIntegrations } from './context';
import IntegrationsMainScreen from './integrations-main-screen';
import {
  CgiProviderStep,
  InventoryProviderStep,
  PhotoProviderStep,
} from './substeps';
import type { OnboardingCallbacks } from './types';

/**
 * Content component that renders the appropriate view based on current state.
 * Receives onboarding callbacks and passes them to substeps.
 */
const IntegrationsContent: React.FC<{
  onboardingCallbacks: OnboardingCallbacks;
}> = ({ onboardingCallbacks }) => {
  const { currentView, loading } = useIntegrations();

  // Show loading spinner while fetching initial data
  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Render the appropriate view based on currentView state
  switch (currentView) {
    case 'inventory-provider':
      return (
        <InventoryProviderStep onboardingCallbacks={onboardingCallbacks} />
      );

    case 'photo-provider':
      return <PhotoProviderStep onboardingCallbacks={onboardingCallbacks} />;

    case 'cgi-provider':
      return <CgiProviderStep onboardingCallbacks={onboardingCallbacks} />;

    case 'main':
    default:
      return (
        <IntegrationsMainScreen onboardingCallbacks={onboardingCallbacks} />
      );
  }
};

export interface IntegrationsFlowProps {
  /** Enterprise ID */
  enterpriseId: string;
  /** Enterprise name */
  enterpriseName: string;
  /** Team ID */
  teamId: string;
  /** Team name */
  teamName: string;
  /** User ID */
  userId: string;
  /** User email - needed for Public API key generation */
  userEmail: string;
  /** Onboarding callbacks - abstracts studio/vini specific navigation */
  onboardingCallbacks: OnboardingCallbacks;
  /** When true, only shows the Inventory Provider step and skips Photo & CGI sections and API calls */
  inventoryOnly?: boolean;
  onShowError?: (content: React.ReactNode) => void;
}

/**
 * Main Integrations Flow component - reusable entry point.
 * Wraps content with IntegrationsProvider and passes onboarding callbacks.
 *
 * Usage:
 * ```tsx
 * <IntegrationsFlow
 *   enterpriseId="..."
 *   enterpriseName="..."
 *   teamId="..."
 *   teamName="..."
 *   userId="..."
 *   userEmail="..."
 *   onboardingCallbacks={{
 *     handleNextStep: () => {...},
 *     handlePrevStep: () => {...},
 *     onboardingStartTime: startTime
 *   }}
 * />
 * ```
 */
const IntegrationsFlow: React.FC<IntegrationsFlowProps> = ({
  enterpriseId,
  enterpriseName,
  teamId,
  teamName,
  userId,
  userEmail,
  onboardingCallbacks,
  inventoryOnly = false,
  onShowError,
}) => {
  return (
    <IntegrationsProvider
      enterpriseId={enterpriseId}
      enterpriseName={enterpriseName}
      teamId={teamId}
      teamName={teamName}
      userId={userId}
      userEmail={userEmail}
      inventoryOnly={inventoryOnly}
      onShowError={onShowError}
    >
      <IntegrationsContent onboardingCallbacks={onboardingCallbacks} />
    </IntegrationsProvider>
  );
};

export default IntegrationsFlow;
