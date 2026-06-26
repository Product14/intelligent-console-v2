import React, { useState } from 'react';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { toast } from 'react-toastify';

import SVG from '@spyne-console/design-system/svg';

import OnboardingStartButton from '@spyne-console/components/onboarding/buttons/onboarding-start-button';

interface GenerateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string) => Promise<string>;
  isGenerating: boolean;
}

const GenerateApiKeyModal: React.FC<GenerateApiKeyModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    try {
      const apiKey = await onGenerate(keyName.trim());
      setGeneratedKey(apiKey);
    } catch (error) {
      toast.error('Failed to generate API key. Please try again.');
    }
  };

  const handleCopyKey = async () => {
    if (!generatedKey) return;

    try {
      await navigator.clipboard.writeText(generatedKey);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const truncateKey = (key: string) => {
    if (key.length <= 10) return key;
    return `${key.substring(0, 3)}...${key.substring(key.length - 3)}`;
  };

  const handleClose = () => {
    setKeyName('');
    setGeneratedKey(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative inline-flex w-[600px] flex-col items-start justify-start gap-8 overflow-hidden rounded-2xl bg-white p-6 shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08)] shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
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

        {/* Header with icon */}
        <div className="mb-2 flex items-center gap-6">
          <img
            src="https://spyne-static.s3.amazonaws.com/console/developer-hub/key-icon.svg"
            alt="API Key"
            className="h-12 w-12"
          />
          <div>
            <div className="justify-start font-['Inter'] text-xl font-semibold leading-7 text-neutral-900">
              Create new API Key
            </div>
            <div className="justify-start font-['Inter'] text-xs font-normal leading-5 text-gray-900">
              Generate and use your API key
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-4">
          {/* Name input */}
          <div className="w-full">
            <div className="mb-2 flex gap-1">
              <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                Add Name
              </span>
              <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                *
              </span>
            </div>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="https://example.com/api/v1/endpoint"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-black/90 transition-all placeholder:text-black/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isGenerating || !!generatedKey}
            />
          </div>

          {/* Generated key display */}
          {generatedKey && (
            <>
              <div className="inline-flex h-14 items-center justify-between self-stretch rounded-lg bg-violet-700/5 px-6 py-4 outline outline-1 outline-offset-[-1px] outline-violet-700/20">
                <div className="justify-center font-['Inter'] text-base font-medium leading-6 text-black/60">
                  {truncateKey(generatedKey || '')}
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="rounded-lg p-2 transition-all duration-150 hover:bg-gray-200 active:scale-90 active:bg-gray-300"
                >
                  <SVG iconName="copy" className="text-blue-light h-6 w-6" />
                </button>
              </div>

              {/* Warning message */}
              <div className="inline-flex flex-col items-start justify-center gap-2.5 self-stretch rounded-[5px] bg-blue-50 p-2.5">
                <div className="flex items-start gap-2">
                  <IoMdInformationCircleOutline className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-800" />
                  <div>
                    <div className="justify-start self-stretch font-['Inter'] text-sm font-semibold leading-5 text-blue-800">
                      Please save this secret key somewhere safe
                    </div>
                    <p className="mt-1 text-sm text-blue-600">
                      For security reasons, you cannot view this secret key
                      again in your Spyne account. If lost, you must generate a
                      new key.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Generate button */}
        <OnboardingStartButton
          buttonClassName="h-[52px] w-full flex justify-center items-center"
          showIcon={false}
          className="w-full"
          onClick={generatedKey ? handleClose : handleGenerate}
          disabled={isGenerating || (!generatedKey && !keyName.trim())}
        >
          {isGenerating
            ? 'Generating...'
            : generatedKey
              ? 'Done'
              : 'Generate New Key'}
        </OnboardingStartButton>
      </div>
    </div>
  );
};

export default GenerateApiKeyModal;
