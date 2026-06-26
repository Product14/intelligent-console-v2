import { Spinner } from '@spyne-console/design-system';

import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { MdCorporateFare, MdDownload } from 'react-icons/md';

import OnboardingPrimaryButton from './buttons/onboarding-primary-button';
import OnboardingSecondaryButton from './buttons/onboarding-secondary-button';

const AiBadge = () => (
  <div
    className="flex h-5 items-center justify-center rounded-full px-2 py-2.5"
    style={{
      background: 'linear-gradient(96.59deg, #037DF7 5.38%, #FF6AFF 94.16%)',
    }}
  >
    <span className="text-xs font-medium italic leading-3 text-white">AI</span>
  </div>
);

const OnboardingPdfViewer = ({
  isOpen = false,
  onClose,
  pdfUrl,
  title = 'Preview Contract',
  subtitle = 'Manage your group dealership details here',
  summaryTitle = 'Contract Summary',
  summaryText = '',
  showAiBadge = true,
  downloadButtonText = 'Download Contract',
  cancelButtonText = 'Cancel',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  const fetchPdfBlob = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfBlobUrl(url);
      // Don't set loading to false here - wait for iframe to load
    } catch (error) {
      console.error('Failed to fetch PDF blob:', error);
      setPdfBlob(null);
      setPdfBlobUrl(null);
      setIsLoading(false); // Only stop loading on error
    }
  };

  // Fetch PDF and cleanup when pdfUrl changes
  useEffect(() => {
    if (pdfUrl) {
      setIsLoading(true); // Reset loading state
      fetchPdfBlob();
    } else {
      setIsLoading(false);
      setPdfBlob(null);
      setPdfBlobUrl(null);
    }

    // Cleanup function to revoke object URL
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfUrl]);

  const handleDownload = () => {
    if (!pdfBlob || !pdfUrl) {
      toast.error('Failed to download PDF');
      return;
    }
    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.download = 'contract.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080]">
      <div className="flex h-[90vh] w-full max-w-[740px] flex-col overflow-hidden rounded-[23px] bg-white shadow-[0px_8px_8px_-4px_#10182808,0px_20px_24px_-4px_#10182814]">
        <div className="flex flex-col p-6">
          <div className="mb-6 flex items-center gap-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[28px] border-8 border-[#4600f20A] bg-[#4600f214]">
              <MdCorporateFare className="h-6 w-6 text-[#4600f2]" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold leading-7 text-[#000000E6]">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  type="button"
                  className="flex h-6 w-6 items-center justify-center"
                >
                  <IoClose className="h-6 w-6 text-[#000000CC]" />
                </button>
              </div>
              <p className="text-sm font-normal leading-5 text-[#00000099]">
                {subtitle}
              </p>
            </div>
          </div>

          {(summaryTitle || summaryText) && (
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-base font-semibold leading-5 text-[#000000CC]">
                  {summaryTitle}
                </span>
                {showAiBadge && <AiBadge />}
              </div>
              {summaryText && (
                <p className="line-clamp-2 text-sm font-normal leading-5 text-[#00000099]">
                  {summaryText}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-6">
          <div className="mb-6 flex flex-1 overflow-hidden rounded-2xl border-2 border-[#0000001A] bg-white">
            {pdfUrl ? (
              <div className="relative h-full w-full">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                    <Spinner type="dark" size="large" />
                  </div>
                )}
                {pdfBlobUrl && (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                    className="h-full w-full"
                    title={title}
                    onLoad={() => {
                      setIsLoading(false);
                    }}
                    onError={() => {
                      console.error('Failed to load PDF in iframe');
                      setIsLoading(false);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <MdCorporateFare className="h-12 w-12 text-[#00000033]" />
                  <p className="text-base font-medium text-[#00000066]">
                    No document to preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 pb-[28px]">
          <OnboardingSecondaryButton onClick={onClose} className="w-full">
            {cancelButtonText}
          </OnboardingSecondaryButton>
          <OnboardingPrimaryButton
            onClick={handleDownload}
            disabled={!pdfUrl}
            showIcon={false}
            className="w-full"
          >
            <div className="flex items-center gap-3">
              <MdDownload className="h-5 w-5" />
              <span>{downloadButtonText}</span>
            </div>
          </OnboardingPrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPdfViewer;
