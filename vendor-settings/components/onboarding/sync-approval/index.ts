// Sync Approval Flow - reusable entry point
export { default as SyncApprovalFlow } from './sync-approval-flow';
export type { SyncApprovalFlowProps } from './sync-approval-flow';

// Context exports
export { SyncApprovalProvider, useSyncApproval } from './context';
export type { SyncApprovalContextType, PrefillEmails } from './context';

// UI Components
export { default as ApprovalIntegrationCard } from './approval-card';
export { default as GroupedApprovalCard } from './grouped-approval-card';
export { default as StatusBadge } from './status-badge';

// Email form components
export {
  EmailApprovalForm,
  PendingEmailForm,
  ApprovalStatusScreen,
  SkippedScreen,
} from './email-form';
export type {
  EmailApprovalFormProps,
  PendingEmailFormProps,
  ApprovalStatusScreenProps,
  FormErrors,
} from './email-form';

// Types
export type {
  ApprovalStatus,
  ApprovalFTPConfig,
  ApprovalData,
  ApprovalInputType,
  IntegrationItem,
  SyncApprovalView,
  ApprovalSubstep,
  EmailFormData,
  GroupedIntegration,
  SyncApprovalData,
  InputIntegrationsRawData,
  OutputIntegrationsRawData,
  OnboardingCallbacks,
} from './types';

// Service
export { default as syncApprovalService } from './sync-approval-service';
