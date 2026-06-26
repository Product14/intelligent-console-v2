import React from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi2';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { IoInformationCircle } from 'react-icons/io5';

import Image from 'next/image';

import OnboardingStartButton from '@spyne-console/components/onboarding/buttons/onboarding-start-button';

import { cn } from '@spyne-console/utils/cn';

import PartnerIconWithFallback from '../integrations/partner-icon-with-fallback';
import StatusBadge from './status-badge';
import type {
  EntityConfig,
  PublishingEntityConfig,
  SmartViewEntityConfig,
  WebhookEntityConfig,
} from './types';
import { isSmartViewConfig, isWebhookConfig } from './types';

interface ApprovalData {
  required: boolean;
  status: 'pending' | 'mail sent' | 'approved' | 'skipped';
}

interface FTPConfig {
  partnerName: string;
  partnerId: string;
  partnerIcon: string;
  dealerId: string;
}

// ApprovalInputType is FTP-only, used for approval logic
interface ApprovalInputType {
  FTP: FTPConfig;
}

// Type for originalEntityConfig
type OriginalEntityConfig =
  | EntityConfig
  | PublishingEntityConfig
  | WebhookEntityConfig[]
  | null;

interface ApprovalIntegrationCardProps {
  title: string;
  subtitle: string;
  iconUrl: string;
  approvalData: ApprovalData;
  /** Whether data has been added/configured for this integration or publishing step */
  isDataAdded?: boolean;
  disabled?: boolean;
  /** FTP config used for approval logic */
  inputType?: ApprovalInputType;
  /** Original entity config used for badge display */
  originalEntityConfig?: OriginalEntityConfig;
  onApprove?: () => void;
  onSkip?: () => void;
  onUndo?: () => void;
  onChange?: () => void;
  /** Hide action buttons (Skip/Approve/Undo) - used when card is part of a grouped approval */
  hideActions?: boolean;
  /** Hide timeline connectors - used when card is nested inside another container */
  hideTimeline?: boolean;
  /** Optional rooftops list for grouped approvals */
  rooftops?: string[];
}

// ============================================================================
// Reusable Sub-Components
// ============================================================================

/** Integration icon with fallback to first letter of name when missing */
const CardIcon = ({
  iconUrl,
  alt,
  bgColor = 'bg-gray-50',
}: {
  iconUrl: string;
  alt: string;
  bgColor?: string;
}) => {
  return (
    <div
      className={cn(
        'flex h-[80px] w-[80px] flex-shrink-0 items-center justify-center rounded-xl',
        bgColor
      )}
    >
      <PartnerIconWithFallback
        icon={iconUrl}
        name={alt}
        size={80}
        rounded="rounded-xl"
      />
    </div>
  );
};

const renderSmartViewBadges = ({
  originalEntityConfig,
  className,
}: {
  originalEntityConfig: SmartViewEntityConfig;
  className?: string;
}) => {
  const hasScriptUrl = Boolean(originalEntityConfig.script_url);
  if (!originalEntityConfig.website_url && !hasScriptUrl) return null;

  return (
    <div
      className={cn('ml-[104px] flex flex-wrap items-center gap-3', className)}
    >
      {hasScriptUrl && (
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-pink-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-pink-700 outline outline-1 outline-offset-[-1px] outline-pink-700/10">
          Script Generated
        </span>
      )}
    </div>
  );
};

/** Input type badges section - shows all applicable badges based on originalEntityConfig */
const InputTypeBadges = ({
  originalEntityConfig,
  className,
}: {
  originalEntityConfig?: OriginalEntityConfig;
  className?: string;
}) => {
  if (!originalEntityConfig) return null;

  // Handle array of webhooks
  if (Array.isArray(originalEntityConfig)) {
    const configuredWebhooks = originalEntityConfig.filter((w) => w.url);
    if (configuredWebhooks.length === 0) return null;
    return (
      <div
        className={cn(
          'ml-[104px] flex flex-wrap items-center gap-3',
          className
        )}
      >
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-rose-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-rose-700 outline outline-1 outline-offset-[-1px] outline-rose-700/10">
          Webhook
        </span>
      </div>
    );
  }

  // Handle single webhook config
  if (isWebhookConfig(originalEntityConfig)) {
    if (!originalEntityConfig.url) return null;
    return (
      <div
        className={cn(
          'ml-[104px] flex flex-wrap items-center gap-3',
          className
        )}
      >
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-rose-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-rose-700 outline outline-1 outline-offset-[-1px] outline-rose-700/10">
          Webhook
        </span>
      </div>
    );
  }

  // Handle SmartView config
  if (isSmartViewConfig(originalEntityConfig)) {
    return renderSmartViewBadges({ originalEntityConfig, className });
  }

  // Handle BaseEntityConfig or EntityConfig
  const ftpConfig = originalEntityConfig.ftp;
  const hasFtp = Boolean(
    ftpConfig?.partnerName && ftpConfig?.partnerId && ftpConfig?.dealerId
  );
  const isNotListedIms = Boolean(
    ftpConfig?.partnerName && !ftpConfig?.partnerId
  );
  const hasApp = originalEntityConfig.app === true;
  const hasConsole = originalEntityConfig.console === true;
  const hasClone = originalEntityConfig.mediaclone === true;
  const hasApi = Boolean(
    originalEntityConfig.api &&
      'apiKey' in originalEntityConfig.api &&
      originalEntityConfig.api.apiKey
  );
  console.log(ftpConfig, 'ftpConfig');
  console.log(hasFtp, 'hasFtp');

  if (
    !hasFtp &&
    !isNotListedIms &&
    !hasApp &&
    !hasConsole &&
    !hasClone &&
    !hasApi
  )
    return null;

  return (
    <div
      className={cn('ml-[104px] flex flex-wrap items-center gap-3', className)}
    >
      {/* Not Listed IMS - Request Raised badge */}
      {isNotListedIms && (
        <div className="inline-flex items-center justify-center gap-1 rounded-2xl bg-sky-50 px-3 py-0.5 outline outline-1 outline-offset-[-1px] outline-sky-700/10">
          <span className="text-center font-['Inter'] text-xs font-medium leading-5 text-sky-700">
            Not Listed - Request Raised for IMS partner
          </span>
        </div>
      )}
      {/* FTP Partner info */}
      {hasFtp && (
        <>
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-2 py-1">
            {ftpConfig?.logo && (
              <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={ftpConfig.logo}
                  alt={ftpConfig?.partnerName || 'Partner'}
                  width={20}
                  height={20}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <span className="text-xs font-medium text-neutral-900">
              {ftpConfig?.partnerName}
            </span>
          </div>
          <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-indigo-50 px-3 py-0.5 text-center text-xs font-medium leading-5 text-indigo-700 outline outline-1 outline-offset-[-1px] outline-indigo-700/10">
            FTP
          </span>
          {/* Dealer ID badge */}
          {ftpConfig?.dealerId && (
            <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-slate-50 px-3 py-0.5 text-center text-xs font-medium leading-5 text-slate-700 outline outline-1 outline-offset-[-1px] outline-slate-700/10">
              Dealer ID: {ftpConfig.dealerId}
            </span>
          )}
        </>
      )}
      {/* Spyne App badge */}
      {hasApp && (
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-sky-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-sky-700 outline outline-1 outline-offset-[-1px] outline-sky-700/10">
          Spyne App
        </span>
      )}
      {/* Spyne Console badge */}
      {hasConsole && (
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-orange-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-orange-700 outline outline-1 outline-offset-[-1px] outline-orange-700/10">
          Spyne Console
        </span>
      )}
      {/* Spyne-Media Cloning badge */}
      {hasClone && (
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-sky-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-sky-700 outline outline-1 outline-offset-[-1px] outline-sky-700/10">
          Spyne-Media Cloning
        </span>
      )}
      {/* Spyne Public API badge */}
      {hasApi && (
        <span className="inline-flex items-center justify-center gap-1 rounded-2xl bg-purple-50 px-2 py-0.5 text-center text-xs font-medium leading-5 text-violet-700 outline outline-1 outline-offset-[-1px] outline-violet-700/10">
          Spyne&apos;s Public API
        </span>
      )}
    </div>
  );
};

/** Change button link */
const ChangeButton = ({
  onClick,
  disabled,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) => {
  if (!onClick) return null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-blue-light rounded-full border border-emerald-700/10 px-3 py-[6px] text-sm font-semibold hover:underline"
    >
      Change
    </button>
  );
};

const RooftopBadges = ({ rooftops }: { rooftops?: string[] }) => {
  if (!rooftops || rooftops.length === 0) return null;

  const [firstRooftop, ...remainingRooftops] = rooftops;
  const remainingCount = remainingRooftops.length;

  return (
    <div className="flex items-center">
      <div className="group relative inline-flex items-center gap-1 rounded-2xl bg-slate-50 px-3 py-0.5 text-center text-xs font-medium leading-5 text-slate-700 outline outline-1 outline-offset-[-1px] outline-slate-700/10">
        <span>Rooftops: {firstRooftop}</span>
        {remainingCount > 0 && (
          <span className="cursor-default font-semibold text-slate-800">
            +{remainingCount}
          </span>
        )}
        {remainingCount > 0 && (
          <div className="pointer-events-none absolute left-0 top-[115%] z-20 hidden min-w-[220px] rounded-lg border border-black/10 bg-white p-2 shadow-lg group-hover:block">
            <div className="space-y-1">
              {remainingRooftops.map((name) => (
                <div
                  key={name}
                  className="text-xs font-medium text-neutral-700"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Card wrapper */
const CardWrapper = ({
  children,
  hideTimeline,
  className,
}: {
  children: React.ReactNode;
  hideTimeline?: boolean;
  className?: string;
}) => (
  <div className={cn('relative z-[99] bg-white', className)}>{children}</div>
);

// ============================================================================
// Main Component
// ============================================================================

const ApprovalIntegrationCard: React.FC<ApprovalIntegrationCardProps> = ({
  title,
  subtitle,
  iconUrl,
  approvalData,
  isDataAdded = true,
  disabled = false,
  inputType,
  originalEntityConfig,
  onApprove,
  onSkip,
  onUndo,
  onChange,
  hideActions = false,
  hideTimeline = false,
  rooftops,
}) => {
  const { required, status } = approvalData;

  // Not Added State
  if (!isDataAdded) {
    return (
      <CardWrapper hideTimeline={hideTimeline}>
        <div
          className={cn(
            'relative rounded-xl border border-[#ECECEC] bg-white p-4',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <CardIcon iconUrl={iconUrl} alt={title} />
              <div className="flex flex-col items-start justify-center gap-2">
                <h3 className="font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
                  {title}
                </h3>
                <p className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-6 py-2">
              <HiOutlineInformationCircle
                className="h-4 w-4 text-neutral-500"
                strokeWidth={2.5}
              />
              <span className="font-['Inter'] text-base font-semibold leading-6 text-neutral-500">
                Not Added
              </span>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Approval Not Required State
  if (!required) {
    return (
      <CardWrapper hideTimeline={hideTimeline}>
        <div
          className={cn(
            'relative rounded-xl border border-[#ECECEC] bg-white p-4',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <CardIcon iconUrl={iconUrl} alt={title} />
              <div className="flex flex-col items-start justify-center gap-2">
                <h3 className="font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
                  {title}
                </h3>
                <p className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-6 py-2">
              <HiOutlineInformationCircle
                className="h-4 w-4 text-indigo-900"
                strokeWidth={2.5}
              />
              <span className="font-['Inter'] text-base font-semibold leading-6 text-indigo-900">
                Approval Not Required
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <InputTypeBadges originalEntityConfig={originalEntityConfig} />
            <RooftopBadges rooftops={rooftops} />
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Approved State
  if (status === 'approved') {
    return (
      <CardWrapper hideTimeline={hideTimeline}>
        <div
          className={cn(
            'relative rounded-xl border p-4',
            hideActions && 'rounded-xl border-[#ECECEC] bg-white',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <CardIcon iconUrl={iconUrl} alt={title} bgColor="bg-white" />
              <div className="flex flex-col items-start justify-center gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
                    {title}
                  </h3>
                  <StatusBadge status={status} />
                </div>
                <p className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <InputTypeBadges originalEntityConfig={originalEntityConfig} />
              <RooftopBadges rooftops={rooftops} />
            </div>
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green-100 px-6 py-2">
              <IoIosCheckmarkCircleOutline
                className="h-4 w-4 text-[#103A1F]"
                strokeWidth={2.5}
              />
              <span className="font-['Inter'] text-base font-semibold leading-6 text-[#103A1F]">
                Integration Approved
              </span>
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Skipped State
  if (status === 'skipped') {
    if (hideActions) {
      return (
        <CardWrapper hideTimeline={hideTimeline}>
          <div
            className={cn(
              'relative rounded-xl border border-[#ECECEC] bg-white p-4',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <CardIcon iconUrl={iconUrl} alt={title} />
                <div className="flex flex-col items-start justify-center gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
                      {title}
                    </h3>
                    <StatusBadge status={status} />
                  </div>
                  <p className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                    {subtitle}
                  </p>
                </div>
              </div>
              <ChangeButton onClick={onChange} disabled={disabled} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InputTypeBadges originalEntityConfig={originalEntityConfig} />
                <RooftopBadges rooftops={rooftops} />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
                <span className="text-sm font-medium text-gray-600">
                  Skipped
                </span>
              </div>
            </div>
          </div>
        </CardWrapper>
      );
    }

    // Full skipped card with banner and Undo button
    return (
      <CardWrapper hideTimeline={hideTimeline}>
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-[#ECECEC] bg-white',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <CardIcon iconUrl={iconUrl} alt={title} />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
                      {title}
                    </h3>
                    <StatusBadge status={status} />
                  </div>
                  <p className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                    {subtitle}
                  </p>
                </div>
              </div>
              <ChangeButton onClick={onChange} disabled={disabled} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <InputTypeBadges originalEntityConfig={originalEntityConfig} />
              <RooftopBadges rooftops={rooftops} />
            </div>
          </div>
          <div className="mx-4 mb-4 flex items-center justify-between rounded-lg border border-[#1890FF33] bg-[#EBFAFF] px-4 py-2">
            <div className="flex items-center gap-2">
              <IoInformationCircle className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-700">
                <span className="font-['Inter'] text-sm font-semibold leading-5 text-[#04297A]">
                  Approval Skipped -
                </span>{' '}
                <span className="font-['Inter'] text-sm font-medium leading-5 text-blue-900">
                  This integration approval request is skipped for now, you can
                  sync it later
                </span>
              </span>
            </div>
            {onUndo && (
              <button
                onClick={onUndo}
                disabled={disabled}
                className="h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Inter'] text-sm font-semibold leading-7 text-neutral-900 transition-colors hover:bg-gray-50"
              >
                Undo
              </button>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Pending State (default)
  return (
    <CardWrapper hideTimeline={hideTimeline}>
      <div
        className={cn(
          'relative rounded-xl border border-[#ECECEC] bg-white p-4',
          hideActions && 'rounded-xl',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <CardIcon iconUrl={iconUrl} alt={title} />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
                  {title}
                </h3>
                {status && <StatusBadge status={status} />}
              </div>
              <p className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                {subtitle}
              </p>
            </div>
          </div>
          <ChangeButton onClick={onChange} disabled={disabled} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <InputTypeBadges originalEntityConfig={originalEntityConfig} />
            <RooftopBadges rooftops={rooftops} />
          </div>
          {!hideActions && (
            <div className="flex items-center gap-3">
              {onSkip && (
                <button
                  onClick={onSkip}
                  disabled={disabled}
                  className="h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Inter'] text-sm font-semibold leading-7 text-neutral-900 transition-colors hover:bg-gray-50"
                >
                  Skip
                </button>
              )}
              {onApprove && (
                <OnboardingStartButton
                  onClick={onApprove}
                  disabled={disabled}
                  showIcon={false}
                  labelClassName="text-white text-sm font-semibold font-['Inter'] leading-7"
                  buttonClassName="h-[44px]"
                >
                  Approve Integration
                </OnboardingStartButton>
              )}
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};

export default ApprovalIntegrationCard;
