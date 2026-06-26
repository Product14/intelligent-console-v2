import React from 'react';
import { IoMdInformationCircle } from 'react-icons/io';
import { IoInformationCircle } from 'react-icons/io5';

import OnboardingStartButton from '@spyne-console/components/onboarding/buttons/onboarding-start-button';

import { cn } from '@spyne-console/utils/cn';

import ApprovalIntegrationCard from './approval-card';
import type { IntegrationItem } from './types';

interface GroupedApprovalCardProps {
  inputIntegrations: IntegrationItem[];
  outputIntegrations: IntegrationItem[];
  partnerName: string;
  partnerIcon: string;
  partnerId: string;
  onApproveAll: () => void;
  onSkipAll: () => void;
  onUndoAll: () => void;
  onChange: (integrationId: string) => void;
  disabled?: boolean;
}

/**
 * Component to display grouped integrations with the same FTP partner
 * Shows input and output integrations together with a common approval button
 */
const GroupedApprovalCard: React.FC<GroupedApprovalCardProps> = ({
  inputIntegrations,
  outputIntegrations,
  partnerName,
  onApproveAll,
  onSkipAll,
  onUndoAll,
  onChange,
  disabled = false,
}) => {
  const allIntegrations = [...inputIntegrations, ...outputIntegrations];

  const allApproved = allIntegrations.every(
    (i) => i.approvalData.status === 'approved'
  );
  const allSkipped = allIntegrations.every(
    (i) => i.approvalData.status === 'skipped'
  );

  const renderIntegrationCard = (
    integration: IntegrationItem,
    sectionLabel?: string
  ) => {
    const inputType =
      integration.type === 'Input'
        ? integration.inputType
        : integration.outputType;

    return (
      <div key={integration.id} className="flex flex-col gap-3">
        {sectionLabel && (
          <p className="mb-1 font-['Inter'] text-base font-semibold leading-6 first-letter:text-neutral-900">
            {sectionLabel}
          </p>
        )}
        <ApprovalIntegrationCard
          title={integration.name}
          subtitle={integration.description}
          iconUrl={integration.iconUrl}
          approvalData={integration.approvalData}
          isDataAdded={integration.isDataAdded}
          inputType={inputType}
          originalEntityConfig={integration.originalEntityConfig}
          onChange={() => onChange(integration.id)}
          disabled={disabled}
          hideActions
          hideTimeline
        />
      </div>
    );
  };

  const renderIntegrationSections = () => (
    <>
      {inputIntegrations.length > 0 && (
        <div className="p-6">
          <div className="flex flex-col gap-3">
            {inputIntegrations.map((integration, index) =>
              renderIntegrationCard(
                integration,
                index === 0 ? 'Import media from' : undefined
              )
            )}
          </div>
        </div>
      )}
      {outputIntegrations.length > 0 && (
        <div className="p-6 pt-0">
          <div className="flex flex-col gap-3">
            {outputIntegrations.map((integration, index) =>
              renderIntegrationCard(
                integration,
                index === 0 ? 'Publishing media on' : undefined
              )
            )}
          </div>
        </div>
      )}
    </>
  );

  const renderBanner = () => {
    if (allApproved) {
      return <></>;
    }

    if (allSkipped) {
      return (
        <div className="flex items-center justify-between rounded-lg border border-[#1890FF33] bg-[#EBFAFF] px-4 py-2">
          <div className="flex items-center gap-2">
            <IoInformationCircle className="h-5 w-5 text-blue-500" />
            <span className="font-['Inter'] text-sm font-semibold leading-7 text-neutral-900">
              <span className="font-['Inter'] text-sm font-semibold leading-5 text-[#04297A]">
                Approval Skipped -
              </span>{' '}
              These integrations are skipped for now, you can sync them later
            </span>
          </div>
          <button
            onClick={onUndoAll}
            disabled={disabled}
            className="h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Inter'] text-sm font-semibold leading-7 text-neutral-900 transition-colors hover:bg-gray-50"
          >
            Undo
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between rounded-lg border border-[#1890FF33] bg-[#EBFAFF] px-4 py-2">
        <div className="flex items-center gap-2">
          <IoMdInformationCircle className="h-5 w-5 text-[#1890FF]" />
          <span className="font-['Inter'] text-sm font-semibold leading-5 text-[#04297A]">
            Your IMS media input, photo provider & publish platform are from the
            same partner, approve all at once.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSkipAll}
            disabled={disabled}
            className="h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Inter'] text-sm font-semibold leading-7 text-neutral-900 transition-colors hover:bg-gray-50"
          >
            Skip
          </button>
          <OnboardingStartButton
            onClick={onApproveAll}
            disabled={disabled}
            showIcon={false}
            labelClassName="text-white text-sm font-semibold font-['Inter'] leading-7"
            buttonClassName="h-[44px]"
          >
            Approve Integration
          </OnboardingStartButton>
        </div>
      </div>
    );
  };

  const cardClassName = cn(
    'relative overflow-hidden rounded-2xl borderborder-gray-200 bg-[#F9FAFB]',
    disabled && 'cursor-not-allowed opacity-60'
  );

  return (
    <div className="relative">
      <div className={cardClassName}>
        {renderIntegrationSections()}
        {!allApproved && <div className="mx-6 mb-5">{renderBanner()}</div>}
      </div>
    </div>
  );
};

export default GroupedApprovalCard;
