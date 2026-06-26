import React from 'react';

import OnboardingStartButton from '@spyne-console/components/onboarding/buttons/onboarding-start-button';

interface ResetApiKeyModalProps {
  onClose: () => void;
  onResetKey: () => void;
  isGenerating: boolean;
}

const ResetApiKeyModal: React.FC<ResetApiKeyModalProps> = ({
  onClose,
  onResetKey,
  isGenerating,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="inline-flex w-96 flex-col items-center justify-start overflow-hidden rounded-xl bg-white p-6 shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08)] shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div>
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <img
              src="https://spyne-static.s3.amazonaws.com/console/developer-hub/refresh-green.svg"
              alt="Refresh"
              className="h-12 w-12"
            />
          </div>

          {/* Title */}
          <div className="mb-1 justify-start self-stretch text-center font-['Inter'] text-lg font-semibold leading-7 text-black/90">
            Refresh API Key
          </div>

          {/* Description */}
          <div className="mb-8 justify-start self-stretch text-center font-['Inter'] text-sm font-normal leading-5 text-black/60">
            Are you sure you want to refresh your key?
          </div>
        </div>

        {/* Buttons */}
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onResetKey}
            disabled={isGenerating}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-4 text-lg font-semibold text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isGenerating ? 'Refreshing...' : 'Yes'}
          </button>

          <OnboardingStartButton
            className="w-full flex-1"
            buttonClassName="h-[52px] w-full flex justify-center items-center"
            onClick={onClose}
            showIcon={false}
          >
            No
          </OnboardingStartButton>
        </div>
      </div>
    </div>
  );
};

export default ResetApiKeyModal;
