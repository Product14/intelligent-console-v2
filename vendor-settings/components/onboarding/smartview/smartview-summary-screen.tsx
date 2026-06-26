import React, { useState } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { IoCheckmark, IoCopyOutline } from 'react-icons/io5';

import OnboardingStartButton from '@spyne-console/components/onboarding/buttons/onboarding-start-button';

import type { SmartViewEntityConfig } from './types';

interface SmartViewSummaryScreenProps {
  readonly config: SmartViewEntityConfig;
  readonly onEditScript: () => void;
  readonly onFinish: () => void;
  readonly enterpriseId: string;
  readonly teamId: string;
  readonly loading?: boolean;
  readonly onShowError?: (message: string) => void;
}

interface SummaryRowProps {
  readonly label: string;
  readonly value: string | undefined;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-100 pb-3 pt-4 last:border-b-0">
    <span className="font-['Inter'] text-base font-semibold leading-6 text-neutral-900">
      {label}
    </span>
    <span className="max-w-[60%] truncate text-right font-['Inter'] text-base font-medium leading-6 text-neutral-900">
      {value || '-'}
    </span>
  </div>
);

const SmartViewSummaryScreen: React.FC<SmartViewSummaryScreenProps> = ({
  config,
  onEditScript,
  onFinish,
  enterpriseId,
  teamId,
  loading = false,
  onShowError,
}) => {
  const showError = onShowError ?? ((msg: string) => console.error(msg));
  const [copied, setCopied] = useState(false);
  const [testVin, setTestVin] = useState('');

  const handleCopyScript = async () => {
    if (!config.script_url) return;

    try {
      await navigator.clipboard.writeText(config.script_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showError('Failed to copy script URL');
    }
  };

  const getIntegrationType = () => {
    if (config.integration_button) return 'Button';
    if (config.integration_page_loader) return 'Page Loader';
    return '-';
  };

  return (
    <div className="mx-auto flex w-full flex-col items-center">
      {/* Modal-like container */}
      <div className="w-full max-w-[800px] rounded-3xl bg-white p-8 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-black/10">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-['Inter'] text-2xl font-semibold leading-9 text-black">
            Integration details summary
          </h2>
          <button
            type="button"
            onClick={onEditScript}
            className="font-['Inter'] text-base font-semibold leading-6 text-[#4600F2] transition-colors hover:text-violet-800"
          >
            Edit Script
          </button>
        </div>

        {/* Summary details */}
        <div className="mb-8">
          <SummaryRow label="Enterprise" value={enterpriseId.slice(0, 10)} />
          <SummaryRow label="Vin xPath" value={config.vehichle_id_xpath} />
          <SummaryRow label="Integration Type" value={getIntegrationType()} />
          <SummaryRow
            label="Team ID"
            value={teamId === 'all' ? 'All Teams' : teamId.slice(0, 10)}
          />
        </div>

        {/* Success message */}
        <div className="mb-6 inline-flex h-14 w-full items-center justify-start gap-3 rounded-[10px] bg-[#F5FBF9] pl-4 outline outline-1 outline-offset-[-1px] outline-emerald-600">
          <FaRegCheckCircle className="h-5 w-5 text-emerald-600" />
          <div className="font-['Inter'] text-base font-semibold leading-6 text-emerald-600">
            Script generated successfully!
          </div>
        </div>

        {/* Script URL */}
        {config.script_url && (
          <div className="mb-6">
            <div className="flex h-14 items-center justify-start gap-2 rounded-[10px] bg-gray-50 px-3 outline outline-1 outline-offset-[-1px] outline-gray-200">
              <span className="flex-1 truncate font-['Inter'] text-base font-normal leading-6 text-gray-600">
                {config.script_url}
              </span>
              <button
                type="button"
                onClick={handleCopyScript}
                className="rounded p-2 transition-colors hover:bg-gray-200"
              >
                {copied ? (
                  <IoCheckmark className="h-5 w-5 text-emerald-600" />
                ) : (
                  <IoCopyOutline className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* View documentation link */}
        <div className="mb-8">
          <a
            href="https://spyne-static.s3.amazonaws.com/website-helper/360_Script_Automation_helper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
          >
            View further steps to test the script
            <HiOutlineExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Finish button */}
        <OnboardingStartButton
          onClick={onFinish}
          disabled={loading}
          showIcon={false}
          className="w-full"
          buttonClassName="h-[52px] w-full flex justify-center items-center"
        >
          {loading ? 'Finishing...' : 'Finish'}
        </OnboardingStartButton>
      </div>
    </div>
  );
};

export default SmartViewSummaryScreen;
