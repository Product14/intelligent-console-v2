import React, { useState } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import {
  IoAlertCircle,
  IoCheckmarkCircle,
  IoEllipse,
  IoGlobeOutline,
} from 'react-icons/io5';

const GRADIENT =
  'linear-gradient(to right, #8400FF 20%, #E100FF 40%, #32D6FF 60%, #90C2FF 75%, #FF4894 90%)';

const SpinnerIcon = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-30"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-80"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const getDomainName = (urlStr) => {
  try {
    const withProtocol = /^https?:\/\//.test(urlStr)
      ? urlStr
      : `https://${urlStr}`;
    const hostname = new URL(withProtocol).hostname.replace(/^www\./, '');
    return hostname.split('.')[0];
  } catch {
    return urlStr;
  }
};

/**
 * @param {{ status?: 'idle'|'scanning'|'completed', scanResult?: { autofilled: number, needsReview: number, notFound: number }, onScanClick?: (url: string) => void, defaultUrl?: string }} props
 */
const isValidUrl = (value) => {
  const withProtocol = /^https?:\/\//.test(value) ? value : `https://${value}`;
  try {
    const { hostname } = new URL(withProtocol);
    return hostname.includes('.');
  } catch {
    return false;
  }
};

const AutofillWithAi = ({
  status = 'idle',
  scanResult,
  onScanClick,
  defaultUrl = '',
}) => {
  const [url, setUrl] = useState(defaultUrl);
  const [urlError, setUrlError] = useState('');

  const isScanning = status === 'scanning';
  const isCompleted = status === 'completed';

  const handleScan = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError('Please enter a website URL');
      return;
    }
    if (!isValidUrl(trimmed)) {
      setUrlError('Please enter a valid URL');
      return;
    }
    setUrlError('');
    onScanClick?.(trimmed);
  };

  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-[20px] border-4 border-white bg-[linear-gradient(180deg,#F8F7FA_0%,#F8F7FA_100%)] p-5 shadow-[0px_2px_16px_-4px_rgba(0,0,0,0.08)]">
      {/* Left: Icon + Text */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white transition-colors duration-300`}
        >
          {isCompleted ? (
            <IoCheckmarkCircle className="bg-purpleGradient h-7 w-7 rounded-full text-white" />
          ) : (
            <HiSparkles className="text-purpleGradient h-6 w-6" />
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          {isCompleted && scanResult ? (
            <>
              <span className="text-lg font-semibold text-black/80">
                Autofilled from {getDomainName(url)}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-black/60">
                  <IoCheckmarkCircle className="h-4 w-4 flex-shrink-0 text-[#12B76A]" />
                  <span className="font-semibold text-black/80">
                    {scanResult.autofilled}
                  </span>
                  &nbsp;Autofilled
                </span>
                <span className="text-black/10">|</span>
                <span className="flex items-center gap-1 text-xs text-black/60">
                  <IoAlertCircle className="h-4 w-4 flex-shrink-0 text-[#F79009]" />
                  <span className="font-semibold text-black/80">
                    {scanResult.needsReview}
                  </span>
                  &nbsp;Needs Review
                </span>
                <span className="text-black/10">|</span>
                <span className="flex items-center gap-1 text-xs text-black/60">
                  <IoEllipse className="h-4 w-4 flex-shrink-0 text-[#D0D5DD]" />
                  <span className="font-semibold text-black/80">
                    {scanResult.notFound}
                  </span>
                  &nbsp;Not Found
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="text-lg font-semibold text-black/80">
                Autofill with AI
              </span>
              <span className="text-sm font-normal text-black/50">
                Drop your website. We'll fill in the rest.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: URL Input + Action Button */}
      <div className="flex flex-shrink-0 items-center gap-3">
        <div className="flex flex-col gap-1">
          <div
            className={`flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 ${urlError ? 'border-[#c31812]' : 'border-black/10'}`}
          >
            <IoGlobeOutline className="h-4 w-4 flex-shrink-0 text-[rgba(0,0,0,0.35)]" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Enter Your Website URL"
              disabled={isScanning}
              className="w-56 border-none bg-transparent text-sm text-black/80 outline-none placeholder:text-[rgba(0,0,0,0.35)] disabled:cursor-not-allowed"
            />
          </div>
          {urlError && (
            <span className="text-[11px] font-medium text-[#c31812]">
              {urlError}
            </span>
          )}
        </div>

        {/* Gradient-border button */}
        <div className="rounded-lg p-[1.5px]" style={{ background: GRADIENT }}>
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning || !url.trim()}
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isScanning && (
              <>
                <span>Scanning Website</span> <SpinnerIcon />
              </>
            )}
            {!isScanning && isCompleted && <span>Re-Scan</span>}
            {!isScanning && !isCompleted && <span>Scan Website</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutofillWithAi;
