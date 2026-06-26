import { createContext, useContext } from 'react';

import type {
  ApprovalStatus,
  ApprovalSubstep,
  EmailFormData,
  InputIntegrationsRawData,
  IntegrationItem,
  OutputIntegrationsRawData,
  SyncApprovalView,
} from '../types';

export interface PrefillEmails {
  pocEmail: string;
  dealerEmail: string;
}

export interface SyncApprovalContextType {
  // Integration data
  inputIntegrationsData: IntegrationItem[];
  outputIntegrationsData: IntegrationItem[];

  // Raw data from API (for reference/debugging)
  rawInputData: InputIntegrationsRawData;
  rawOutputData: OutputIntegrationsRawData;

  // Current view/screen state
  currentView: SyncApprovalView;

  // Approval substep state (null = showing integrations list)
  approvalSubstep: ApprovalSubstep | null;

  // Loading states
  loading: boolean;
  saving: boolean;

  // Meeting scheduled flag
  isScheduled: boolean;
  scheduledReminderTime: { start: string; end: string } | null;

  // Navigation handlers
  goToMainScreen: () => void;

  // Approval handlers
  handleApprove: (
    integrationId: string,
    isInput: boolean,
    partnerName: string,
    partnerId: string,
    dealerId: string,
    currentStatus: ApprovalStatus
  ) => void;
  handleBatchApprove: (
    integrationIds: string[],
    partnerName: string,
    partnerId: string,
    dealerId: string,
    currentStatus: ApprovalStatus
  ) => void;
  handleSkip: (integrationId: string, isInput: boolean) => void;
  handleBatchSkip: (integrationIds: string[]) => void;
  handleUndo: (integrationId: string, isInput: boolean) => void;
  handleBatchUndo: (integrationIds: string[]) => void;
  handleChange: (integrationId: string) => void;

  // Email flow handlers
  handleSendEmail: (formData: EmailFormData) => Promise<void>;
  handleApproveConfirm: () => Promise<void>;
  handleFinalConfirm: () => void;
  handleBackToList: () => void;

  // Status update handler
  updateIntegrationStatus: (
    integrationId: string,
    newStatus: ApprovalStatus,
    isInput: boolean
  ) => void;

  // Refetch data
  refetchData: () => Promise<void>;

  // Prefill emails fetched from API
  prefillEmails: PrefillEmails;

  // Partner email fetched by partner ID (for IMS email prefill)
  partnerEmail: string;
  partnerEmailLoading: boolean;

  // Props passed to provider
  enterpriseId: string;
  enterpriseName: string;
  teamId: string;
  teamName: string;
  userId: string;
}

export const SyncApprovalContext =
  createContext<SyncApprovalContextType | null>(null);

export function useSyncApproval() {
  const context = useContext(SyncApprovalContext);
  if (!context) {
    throw new Error(
      'useSyncApproval must be used within a SyncApprovalProvider'
    );
  }
  return context;
}
