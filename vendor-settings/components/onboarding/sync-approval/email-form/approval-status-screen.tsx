import React from 'react';
import { FaCheck } from 'react-icons/fa6';

import OnboardingStartButton from '@spyne-console/components/onboarding/buttons/onboarding-start-button';

import StepWrapper from '../../integrations/step-wrapper';

// Approval Status Badge component
interface ApprovalStatusBadgeProps {
  isSubmitting: boolean;
  isApproved: boolean;
}

const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
  isSubmitting,
  isApproved,
}) => {
  if (isSubmitting) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 pr-3 font-['Inter'] text-sm font-medium leading-5 text-gray-600">
        <svg
          className="h-3.5 w-3.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Approving...
      </span>
    );
  }

  if (isApproved) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-1 pr-3 font-['Inter'] text-sm font-medium leading-5 text-green-700">
        <FaCheck className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 pr-3 font-['Inter'] text-sm font-medium leading-5 text-yellow-700">
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" d="M12 6v6l4 2" />
      </svg>
      Pending
    </span>
  );
};

// Steps to follow list
const StepsToFollow: React.FC = () => (
  <div className="flex flex-col gap-4">
    <h3 className="text-xl font-semibold text-black">Steps to follow</h3>
    <ul className="space-y-3">
      <li className="flex items-start gap-2">
        <span className="text-black/60">◇</span>
        <span className="font-['Inter'] text-base font-normal leading-6 text-black/60">
          Check your inbox for an email from support@spyne.ai.
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-black/60">◇</span>
        <span className="font-['Inter'] text-base font-normal leading-6 text-black/60">
          Open and reply all for approval
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-black/60">◇</span>
        <span className="font-['Inter'] text-base font-normal leading-6 text-black/60">
          Approve your IMS feed export to Spyne and send it to IMS.
        </span>
      </li>
    </ul>
  </div>
);

// Approval Status Screen component (Mail Sent / Approved states)
export interface ApprovalStatusScreenProps {
  title: string;
  subtitle: string;
  partnerName: string;
  isApproved: boolean;
  isScheduled?: boolean;
  isSubmitting: boolean;
  reminderTime: { start: string; end: string };
  onApprove: () => void;
  onConfirm: () => void;
  onboardingStartTime?: string | number | null;
}

const ApprovalStatusScreen: React.FC<ApprovalStatusScreenProps> = ({
  title,
  subtitle,
  partnerName,
  isApproved,
  isScheduled = false,
  isSubmitting,
  reminderTime,
  onApprove,
  onConfirm,
  onboardingStartTime,
}) => (
  <StepWrapper
    title={title}
    subtitle={subtitle}
    onNext={isApproved ? onConfirm : () => {}}
    nextLabel={isApproved ? 'Continue' : ''}
    isLastStep={false}
    isNextDisabled={false}
    hideFooter={!isApproved}
    isBackDisabled={true}
    onboardingStartTime={onboardingStartTime}
  >
    <div className="my-6 flex h-full w-full flex-1 justify-between overflow-hidden rounded-xl bg-white">
      {/* Left - Steps to follow */}
      <div
        className={`${!isApproved ? 'w-[40%]' : 'w-[60%]'} scrollbar-hide h-full overflow-y-auto py-6`}
      >
        <div className="flex h-full flex-col gap-12">
          <StepsToFollow />

          {/* Approval Status */}
          <div className="flex items-center gap-2">
            <span className="font-['Inter'] text-base font-semibold leading-6 text-gray-900">
              Approval Status:
            </span>
            <ApprovalStatusBadge
              isSubmitting={isSubmitting}
              isApproved={isApproved}
            />
          </div>

          {/* Approve section - only show when not approved */}
          {!isApproved && (
            <div>
              <p className="mb-4 font-['Inter'] text-base font-semibold leading-6 text-neutral-900">
                Please approve once you received email from dealership
              </p>
              <OnboardingStartButton
                onClick={onApprove}
                disabled={isSubmitting}
                showIcon={false}
                buttonClassName="h-[40px]"
                labelClassName="text-sm font-medium font-['Inter'] leading-6"
              >
                {isSubmitting ? 'Approving...' : 'Approve'}
              </OnboardingStartButton>
            </div>
          )}

          {/* Reminder section */}
          {isApproved && isScheduled && (
            <div className="flex flex-col gap-3">
              <div className="justify-center self-stretch font-['Inter'] text-sm font-medium leading-5 text-black/80">
                Reminder scheduled on your calendar to enable export from{' '}
                {partnerName?.toUpperCase?.() || partnerName}
              </div>
              <div className="inline-flex flex-col items-start justify-center gap-4 self-stretch rounded-xl bg-sky-50 px-4 py-3 outline outline-1 outline-offset-[-1px] outline-sky-700/10">
                <div className="inline-flex w-full items-center justify-between">
                  <div className="justify-center font-['Inter'] text-base font-semibold leading-6 text-black/80">
                    Scheduled for today at {reminderTime.start} -{' '}
                    {reminderTime.end}
                  </div>
                  <div className="justify-start text-center font-['Inter'] text-sm font-semibold leading-5 text-violet-700 opacity-0">
                    Edit
                  </div>
                </div>
              </div>
              <div className="mt-8 flex h-[50px] w-fit items-center justify-center gap-2 rounded-lg bg-[#E3FCEF] px-3">
                <FaCheck className="h-4 w-4 text-[#006644]" />
                <span className="font-['Inter'] text-base font-semibold leading-6 text-black">
                  Integration request raised with IMS successfully
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isApproved && (
        <div className="flex w-[60%] flex-col overflow-hidden rounded-xl bg-white">
          <video
            src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/OB+Updated3+(1).webm"
            autoPlay
            loop
            muted
            playsInline
            className="h-auto w-full overflow-hidden rounded-[1.8rem] [@media(max-height:800px)]:rounded-[3rem]"
          />
        </div>
      )}
    </div>
  </StepWrapper>
);

// Skipped state component
interface SkippedScreenProps {
  onBack: () => void;
  onboardingStartTime?: string | number | null;
}

export const SkippedScreen: React.FC<SkippedScreenProps> = ({
  onBack,
  onboardingStartTime,
}) => (
  <StepWrapper
    title="Integration Skipped"
    subtitle="This integration has been skipped"
    onNext={onBack}
    nextLabel="Back to Integrations"
    isLastStep={false}
    onboardingStartTime={onboardingStartTime}
  >
    <div className="flex h-full items-center justify-center">
      <p className="text-gray-600">This integration has been skipped.</p>
    </div>
  </StepWrapper>
);

export default ApprovalStatusScreen;
