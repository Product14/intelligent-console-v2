import { createContext, useContext } from 'react';

import type { EntityConfig, IntegrationEntityResponse } from '../types';

export type IntegrationStepId =
  | 'inventory-provider'
  | 'photo-provider'
  | 'cgi-provider';

export interface IntegrationStep {
  id: IntegrationStepId;
  title: string;
  subtitle: string;
  iconUrl: string;
  mandatory: boolean;
  done: boolean;
  disabled: boolean;
}

export type CurrentView = 'main' | IntegrationStepId;

export interface IntegrationsData {
  inventory: IntegrationEntityResponse | null;
  photo: IntegrationEntityResponse | null;
  cgi: IntegrationEntityResponse | null;
}

export interface IntegrationsContextType {
  // Steps configuration
  steps: IntegrationStep[];

  // Current view state
  currentView: CurrentView;

  // Navigation handlers
  goToStep: (stepId: IntegrationStepId) => void;
  goToMainScreen: () => void;

  // Confirm step with optional entity config to save
  confirmStep: (
    stepId: IntegrationStepId,
    entityConfig?: EntityConfig,
    skipMoveToNextStep?: boolean
  ) => Promise<void>;

  // Computed states
  canProceedToNextOnboardingStep: boolean;
  allMandatoryDone: boolean;
  allStepsDone: boolean;

  // Loading states
  loading: boolean;
  saving: boolean;

  // Props passed to provider
  hasNewVehicleEnabled: boolean;
  enterpriseId: string;
  teamId: string;
  userId: string;
  userEmail: string;

  // When true, only Inventory Provider step is shown (photo & CGI are hidden)
  inventoryOnly: boolean;

  // Raw integrations data from API
  integrationsData: IntegrationsData;
}

export const IntegrationsContext =
  createContext<IntegrationsContextType | null>(null);

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error(
      'useIntegrations must be used within an IntegrationsProvider'
    );
  }
  return context;
}
