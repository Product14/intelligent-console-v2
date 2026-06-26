import React, { useEffect, useState } from 'react';

// @ts-ignore
import SVG from '@spyne-console/design-system/svg';

import { fetchEnabledChannels } from '@spyne-console/actions/inventory/publishing';

import {
  createCollapsedButtonsConfig,
  createSocialButtonsConfig,
} from '../config';
import { ButtonConfig, PublishingData } from '../types';
import { YoutubeModal } from './social-media/youtube';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: PublishingData;
  onDownloadClick?: () => void;
  showToast?: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  data,
  onDownloadClick,
  showToast,
}) => {
  const [showAllSocial, setShowAllSocial] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setShowAllSocial(false);

      // Fetch enabled platforms
      if (data?.enterpriseId && data?.teamId) {
        fetchEnabledChannels({
          enterpriseId: data.enterpriseId,
          teamId: data.teamId,
        }).then((platforms: string[]) => {
          setEnabledPlatforms(platforms);
        });
      }
    }
  }, [isOpen, data?.enterpriseId, data?.teamId]);

  if (!isOpen) return null;

  const getShareUrl = () => {
    if (!data?.mediaId) return '';

    const isUAT =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('uat') ||
        window.location.hostname.includes('localhost'));
    const baseUrl = isUAT
      ? 'https://uat-master.360-fe.pages.dev/360'
      : 'https://assets.spyne.ai/360';

    const params = isUAT
      ? `version=v3&mediaId=${data.mediaId}&spin=1&catalog=2&feature_video=3`
      : `version=v3&mediaId=${data.mediaId}&template=t2&threed=2`;

    return `${baseUrl}?${params}`;
  };

  const handleDownload = () => {
    if (onDownloadClick) {
      onDownloadClick();
      onClose();
    } else {
      console.log('No onDownloadClick callback provided');
    }
  };

  const handleCopyLink = () => {
    const link = getShareUrl();
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleDisabledClick = (platform: string) => {
    console.log(`${platform} publishing coming soon!`);
  };

  // Button configurations from config file
  const socialButtons = createSocialButtonsConfig(
    setYoutubeModalOpen,
    handleDisabledClick,
    enabledPlatforms
  );
  const collapsedButtons = createCollapsedButtonsConfig(
    handleDownload,
    setShowAllSocial,
    socialButtons
  );

  const handleOpenLink = () => {
    const link = getShareUrl() || window.location.href;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const renderShareWithLink = () => {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Share with link
          </span>
          <button onClick={handleOpenLink} className="hover:opacity-70">
            <SVG iconName="ExternalLink" width={16} height={16} />
          </button>
        </div>
        <input
          type="text"
          readOnly
          value={getShareUrl()}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
        />
        <button
          onClick={handleCopyLink}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-50 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-100"
        >
          <SVG iconName="copy" width={20} height={20} />
          {isCopied ? 'Copied' : 'Copy Link'}
        </button>
      </div>
    );
  };

  const renderButton = (button: ButtonConfig, isCollapsed: boolean) => {
    const size = isCollapsed
      ? button.iconSize.collapsed
      : button.iconSize.expanded;
    const containerSize = isCollapsed ? 'h-14 w-14' : 'h-12 w-12';
    const disabledClasses = button.disabled
      ? 'opacity-40 cursor-not-allowed'
      : '';

    return (
      <button
        key={button.id}
        onClick={button.onClick}
        className={`flex flex-col items-center gap-2 ${disabledClasses}`}
      >
        <div
          className={`flex ${containerSize} items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300`}
        >
          <SVG
            iconName={button.iconName}
            width={size}
            height={size}
            className={button.variant === 'more' ? 'rotate-90' : ''}
          />
        </div>
        <span
          className={`text-xs font-medium ${button.disabled ? 'text-gray-400' : 'text-gray-700'}`}
        >
          {button.label}
        </span>
      </button>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <div
          className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
          >
            <SVG iconName="cross" width={24} height={24} />
          </button>

          {/* Header */}
          <h2 className="mb-6 text-lg font-semibold text-gray-900">
            Share this {showAllSocial ? data?.title || '4 Vehicle' : 'Vehicle'}
          </h2>

          {/* Collapsed State */}
          {!showAllSocial ? (
            <div className="space-y-6">
              <div className="flex justify-between">
                {collapsedButtons.map((button) => renderButton(button, true))}
              </div>
              {renderShareWithLink()}
            </div>
          ) : (
            /* Expanded State */
            <div className="space-y-6">
              {/* Save Section */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Save
                </h3>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
                    <SVG
                      iconName="DownloadVirtual"
                      className="fill-black/80"
                      width={24}
                      height={24}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Download
                  </span>
                </button>
              </div>

              {/* Social Section */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Social
                </h3>
                <div className="flex justify-between">
                  {socialButtons.map((button) => renderButton(button, false))}
                </div>
              </div>

              {renderShareWithLink()}
            </div>
          )}
        </div>
      </div>

      {/* YouTube Modal */}
      <YoutubeModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onCloseAll={onClose}
        vehicleData={data}
        showToast={showToast}
      />
    </>
  );
};
