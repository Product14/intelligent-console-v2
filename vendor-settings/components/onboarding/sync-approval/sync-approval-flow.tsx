/**
 * Sync Approval Flow - Reusable entry point
 *
 * This step handles approval for FTP integrations (both input and output).
 * It displays a list of integrations and allows the user to approve, skip,
 * or send approval emails.
 *
 * Similar to IntegrationsFlow, it accepts onboardingCallbacks to abstract
 * studio/vini specific navigation (handleNextStep, handlePrevStep, etc.).
 */
import React, { useMemo } from 'react';

import StepWrapper from '../integrations/step-wrapper';
import ApprovalIntegrationCard from './approval-card';
import { SyncApprovalProvider, useSyncApproval } from './context';
import EmailApprovalForm from './email-form/email-approval-form';
import GroupedApprovalCard from './grouped-approval-card';
import type {
  ApprovalFTPConfig,
  ApprovalStatus,
  GroupedIntegration,
  IntegrationItem,
  OnboardingCallbacks,
} from './types';

/**
 * Type for ungrouped integrations - either input or output
 */
type UngroupedRenderItem =
  | { type: 'ungrouped-input'; integration: IntegrationItem }
  | { type: 'ungrouped-output'; integration: IntegrationItem };

/**
 * Content component that renders based on current view.
 * Receives onboarding callbacks and uses them for navigation.
 */
const SyncApprovalContent: React.FC<{
  onboardingCallbacks: OnboardingCallbacks;
}> = ({ onboardingCallbacks }) => {
  const { handleNextStep, handlePrevStep, onboardingStartTime } =
    onboardingCallbacks;
  const {
    inputIntegrationsData,
    outputIntegrationsData,
    currentView,
    approvalSubstep,
    loading,
    handleApprove,
    handleBatchApprove,
    handleSkip,
    handleBatchSkip,
    handleUndo,
    handleBatchUndo,
    handleChange,
    handleSendEmail,
    handleApproveConfirm,
    handleFinalConfirm,
    handleBackToList,
    prefillEmails,
    partnerEmail,
    partnerEmailLoading,
    isScheduled,
    scheduledReminderTime,
  } = useSyncApproval();

  /**
   * Helper to get the group key from FTP config and status
   * Includes status and dealerId so that integrations with different statuses
   * or dealerIds are not grouped together
   */
  const getGroupKey = (
    ftpConfig?: ApprovalFTPConfig,
    status?: ApprovalStatus
  ): string | null => {
    if (
      !ftpConfig?.partnerName ||
      !ftpConfig?.partnerId ||
      !ftpConfig?.dealerId
    )
      return null;
    return `${ftpConfig.partnerName}::${ftpConfig.partnerId}::${ftpConfig.dealerId}::${status}`;
  };

  /**
   * Group integrations by FTP partner (matching partnerName + partnerId + dealerId + status)
   * Categorises ungrouped integrations (both input & output) into:
   *   1. groupedCards          – grouped approval cards
   *   2. approvalRequiredItems – data added & approval required
   *   3. approvalNotRequired   – data added & approval NOT required
   *   4. notAddedItems         – data not yet added
   */
  const {
    groupedCards,
    approvalRequiredItems,
    approvalNotRequiredItems,
    notAddedItems,
  } = useMemo(() => {
    const groups: Map<string, GroupedIntegration> = new Map();
    const ungroupedOutput: IntegrationItem[] = [];

    // First pass: identify all FTP partners from input integrations
    inputIntegrationsData.forEach((integration, index) => {
      const ftpConfig = integration.inputType?.FTP;
      const status = integration.approvalData.status;
      const groupKey = getGroupKey(ftpConfig, status);

      if (groupKey && ftpConfig) {
        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            partnerId: ftpConfig.partnerId,
            partnerName: ftpConfig.partnerName,
            partnerIcon: ftpConfig.partnerIcon,
            inputIntegrations: [],
            outputIntegrations: [],
            status,
            firstInputIndex: index,
          });
        }
        groups.get(groupKey)!.inputIntegrations.push(integration);
      }
    });

    // Second pass: match output integrations to existing groups
    outputIntegrationsData.forEach((integration) => {
      const ftpConfig = integration.outputType?.FTP;
      const status = integration.approvalData.status;
      const groupKey = getGroupKey(ftpConfig, status);

      if (groupKey && groups.has(groupKey)) {
        groups.get(groupKey)!.outputIntegrations.push(integration);
      } else {
        ungroupedOutput.push(integration);
      }
    });

    // Build valid groups (2+ inputs OR has both input and output)
    const validGroupKeys = new Set<string>();
    groups.forEach((group, key) => {
      if (
        group.inputIntegrations.length >= 2 ||
        group.outputIntegrations.length > 0
      ) {
        validGroupKeys.add(key);
      }
    });

    // Collect grouped cards (deduplicated)
    const grouped: { group: GroupedIntegration; key: string }[] = [];
    const shownGroupKeys = new Set<string>();

    inputIntegrationsData.forEach((integration) => {
      const ftpConfig = integration.inputType?.FTP;
      const status = integration.approvalData.status;
      const groupKey = getGroupKey(ftpConfig, status);

      if (
        groupKey &&
        validGroupKeys.has(groupKey) &&
        !shownGroupKeys.has(groupKey)
      ) {
        grouped.push({ group: groups.get(groupKey)!, key: groupKey });
        shownGroupKeys.add(groupKey);
      }
    });

    // Collect all ungrouped integrations (input + output)
    const allUngrouped: UngroupedRenderItem[] = [];

    inputIntegrationsData.forEach((integration) => {
      const ftpConfig = integration.inputType?.FTP;
      const status = integration.approvalData.status;
      const groupKey = getGroupKey(ftpConfig, status);

      if (!(groupKey && validGroupKeys.has(groupKey))) {
        allUngrouped.push({ type: 'ungrouped-input', integration });
      }
    });

    ungroupedOutput.forEach((integration) => {
      allUngrouped.push({ type: 'ungrouped-output', integration });
    });

    // Categorise ungrouped items
    const approvalRequired: UngroupedRenderItem[] = [];
    const approvalNotReq: UngroupedRenderItem[] = [];
    const notAdded: UngroupedRenderItem[] = [];

    allUngrouped.forEach((item) => {
      const integration = item.integration;
      if (!integration.isDataAdded) {
        notAdded.push(item);
      } else if (integration.approvalData.required) {
        approvalRequired.push(item);
      } else {
        approvalNotReq.push(item);
      }
    });

    return {
      groupedCards: grouped,
      approvalRequiredItems: approvalRequired,
      approvalNotRequiredItems: approvalNotReq,
      notAddedItems: notAdded,
    };
  }, [inputIntegrationsData, outputIntegrationsData]);

  /**
   * Check if all integrations that require approval are either approved or skipped.
   * Continue button should be disabled if any integration requires approval but
   * is still pending/mail sent.
   */
  const canProceed = useMemo(() => {
    const allIntegrations = [
      ...inputIntegrationsData,
      ...outputIntegrationsData,
    ];

    if (allIntegrations.length === 0) return true;

    return allIntegrations.every((integration) => {
      const { required, status } = integration.approvalData;
      if (!required) return true;
      return status === 'approved' || status === 'skipped';
    });
  }, [inputIntegrationsData, outputIntegrationsData]);

  /**
   * Check if any integration that requires approval is skipped or not yet approved.
   * When true, moving to next step should NOT mark the current step as completed.
   */
  const hasSkippedOrUnapprovedRequired = useMemo(() => {
    const allIntegrations = [
      ...inputIntegrationsData,
      ...outputIntegrationsData,
    ];

    return allIntegrations.some((integration) => {
      const { required, status } = integration.approvalData;
      return required && status !== 'approved';
    });
  }, [inputIntegrationsData, outputIntegrationsData]);

  // If we're in an approval substep, show the email form
  if (currentView === 'email-form' && approvalSubstep) {
    return (
      <EmailApprovalForm
        title={`Approve integration with ${approvalSubstep.partnerName}`}
        subtitle="Send email for integration approval"
        partnerName={approvalSubstep.partnerName}
        initialValues={{
          toEmail: partnerEmail,
          dealerId: approvalSubstep.dealerId,
          ccSpynePoc: prefillEmails.pocEmail,
          ccDealershipEmail: prefillEmails.dealerEmail,
        }}
        partnerEmailLoading={partnerEmailLoading}
        currentStatus={approvalSubstep.currentStatus}
        isScheduled={isScheduled}
        scheduledReminderTime={scheduledReminderTime}
        onSendEmail={handleSendEmail}
        onApprove={handleApproveConfirm}
        onConfirm={handleFinalConfirm}
        onBack={handleBackToList}
      />
    );
  }

  // Show the integrations list
  return (
    <StepWrapper
      title="Integration Approvals"
      subtitle="Approve your input and output integrations"
      onNext={() => {
        handleNextStep({ skipCompletion: hasSkippedOrUnapprovedRequired });
      }}
      secondaryButtonLabel="Back"
      secondaryButtonOnClick={() => {
        handlePrevStep();
      }}
      isLastStep={false}
      isNextDisabled={!canProceed}
      onboardingStartTime={onboardingStartTime}
    >
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <div className="relative flex flex-1 flex-col">
            {/* Vertical connector line - continuous dashed line */}
            <div className="absolute bottom-[60px] left-[40px] top-[40px] z-[10] w-px border-l border-dashed border-gray-300" />

            <div className="z-[99] flex flex-col gap-10">
              {/* 1. Grouped Approval Cards */}
              {groupedCards.map(({ group, key }, index) => {
                const allIds = [
                  ...group.inputIntegrations.map((i) => i.id),
                  ...group.outputIntegrations.map((i) => i.id),
                ];
                const dealerId =
                  group.inputIntegrations[0]?.inputType?.FTP?.dealerId ??
                  group.outputIntegrations[0]?.outputType?.FTP?.dealerId ??
                  '';
                return (
                  <GroupedApprovalCard
                    key={`group-${key}-${index}`}
                    inputIntegrations={group.inputIntegrations}
                    outputIntegrations={group.outputIntegrations}
                    partnerName={group.partnerName}
                    partnerIcon={group.partnerIcon}
                    partnerId={group.partnerId}
                    onApproveAll={() =>
                      handleBatchApprove(
                        allIds,
                        group.partnerName,
                        group.partnerId,
                        dealerId,
                        group.status
                      )
                    }
                    onSkipAll={() => handleBatchSkip(allIds)}
                    onUndoAll={() => handleBatchUndo(allIds)}
                    onChange={handleChange}
                  />
                );
              })}

              {/* 2. Approval Required Cards (data added, approval needed) */}
              {approvalRequiredItems.map((item, index) => {
                const integration = item.integration;
                const isInput = item.type === 'ungrouped-input';
                const ftpType = isInput
                  ? integration.inputType
                  : integration.outputType;
                const isFirstInput =
                  isInput &&
                  approvalRequiredItems.findIndex(
                    (i) => i.type === 'ungrouped-input'
                  ) === index;
                const isFirstOutput =
                  !isInput &&
                  approvalRequiredItems.findIndex(
                    (i) => i.type === 'ungrouped-output'
                  ) === index;
                return (
                  <React.Fragment key={integration.id}>
                    {isFirstInput && (
                      <div className="z-[99] justify-start font-['Inter'] text-base font-semibold leading-6 text-neutral-900">
                        Import media from
                      </div>
                    )}
                    {isFirstOutput && (
                      <div className="justify-start font-['Inter'] text-base font-semibold leading-6 text-neutral-900">
                        Approve inventory sync for your media Publishing
                      </div>
                    )}
                    <ApprovalIntegrationCard
                      title={integration.name}
                      subtitle={integration.description}
                      iconUrl={integration.iconUrl}
                      approvalData={integration.approvalData}
                      isDataAdded={integration.isDataAdded}
                      inputType={ftpType}
                      originalEntityConfig={integration.originalEntityConfig}
                      onApprove={() =>
                        handleApprove(
                          integration.id,
                          isInput,
                          ftpType?.FTP?.partnerName ?? '',
                          ftpType?.FTP?.partnerId ?? '',
                          ftpType?.FTP?.dealerId ?? '',
                          integration.approvalData.status
                        )
                      }
                      onSkip={() => handleSkip(integration.id, isInput)}
                      onUndo={() => handleUndo(integration.id, isInput)}
                      onChange={() => handleChange(integration.id)}
                    />
                  </React.Fragment>
                );
              })}

              {/* 3. Approval Not Required Cards (data added, no approval needed) */}
              {approvalNotRequiredItems.map((item) => {
                const integration = item.integration;
                const isInput = item.type === 'ungrouped-input';
                const ftpType = isInput
                  ? integration.inputType
                  : integration.outputType;
                return (
                  <React.Fragment key={integration.id}>
                    <ApprovalIntegrationCard
                      title={integration.name}
                      subtitle={integration.description}
                      iconUrl={integration.iconUrl}
                      approvalData={integration.approvalData}
                      isDataAdded={integration.isDataAdded}
                      inputType={ftpType}
                      originalEntityConfig={integration.originalEntityConfig}
                      onChange={() => handleChange(integration.id)}
                    />
                  </React.Fragment>
                );
              })}

              {/* 4. Not Added Cards (data not configured yet) */}
              {notAddedItems.map((item) => {
                const integration = item.integration;
                return (
                  <React.Fragment key={integration.id}>
                    <ApprovalIntegrationCard
                      title={integration.name}
                      subtitle={integration.description}
                      iconUrl={integration.iconUrl}
                      approvalData={integration.approvalData}
                      isDataAdded={integration.isDataAdded}
                      onChange={() => handleChange(integration.id)}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StepWrapper>
  );
};

export interface SyncApprovalFlowProps {
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
  /** Product line ID — used to fetch POC and dealer emails */
  productLineId?: string;
  /** Onboarding callbacks - abstracts studio/vini specific navigation */
  onboardingCallbacks: OnboardingCallbacks;
  /** Callback to navigate to a specific onboarding step and substep */
  onNavigateToStep?: (parentStep: string, substepId: string) => void;
  /** When true, only shows the IMS (inventory-provider) approval card and skips all others */
  imsOnly?: boolean;
  /** Optional error handler (e.g. toast.error). Falls back to console.error */
  onShowError?: (message: string) => void;
}

/**
 * Main Sync Approval Flow component - reusable entry point.
 * Wraps content with SyncApprovalProvider and passes onboarding callbacks.
 *
 * Usage:
 * ```tsx
 * <SyncApprovalFlow
 *   enterpriseId="..."
 *   enterpriseName="..."
 *   teamId="..."
 *   teamName="..."
 *   userId="..."
 *   productLineId="..."
 *   onboardingCallbacks={{
 *     handleNextStep: () => {...},
 *     handlePrevStep: () => {...},
 *     onboardingStartTime: startTime
 *   }}
 *   onNavigateToStep={(parentStep, substepId) => {...}}
 * />
 * ```
 */
const SyncApprovalFlow: React.FC<SyncApprovalFlowProps> = ({
  enterpriseId,
  enterpriseName,
  teamId,
  teamName,
  userId,
  productLineId,
  onboardingCallbacks,
  onNavigateToStep,
  imsOnly = false,
  onShowError,
}) => {
  return (
    <SyncApprovalProvider
      enterpriseId={enterpriseId}
      enterpriseName={enterpriseName}
      teamId={teamId}
      teamName={teamName}
      userId={userId}
      productLineId={productLineId}
      onNavigateToStep={onNavigateToStep}
      imsOnly={imsOnly}
      onShowError={onShowError}
    >
      <SyncApprovalContent onboardingCallbacks={onboardingCallbacks} />
    </SyncApprovalProvider>
  );
};

export default SyncApprovalFlow;
