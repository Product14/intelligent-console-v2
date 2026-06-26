import React, { useCallback, useState } from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { IoCopyOutline, IoRefresh } from 'react-icons/io5';
import { toast } from 'react-toastify';

import Image from 'next/image';

import Spinner from '@spyne-console/design-system/spinner';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import GenerateApiKeyModal from './generate-api-key-modal';
import ResetApiKeyModal from './reset-api-key-modal';

export interface ApiKeyData {
  name: string;
  apiKey: string;
  dateCreated: string;
  createdBy: string;
}

interface PublicApiScreenProps {
  onBack: () => void;
  onApiKeyGenerated?: (apiKey: ApiKeyData) => void;
  existingApiKey?: ApiKeyData | null;
  loading?: boolean;
  /** These props replace the Redux selectors - passed from top level */
  enterpriseId: string;
  teamId: string;
  userId: string;
  userEmail: string;
}

const PublicApiScreen: React.FC<PublicApiScreenProps> = ({
  onBack,
  onApiKeyGenerated,
  existingApiKey = null,
  loading = false,
  enterpriseId,
  teamId,
  userId,
  userEmail,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Handle API key generation
  const handleGenerateApiKey = useCallback(
    async (name: string): Promise<string> => {
      const apiUrl = `${process.env.APP_BACKEND_BASEURL}/user-management/v1/token/generate`;
      const response = await CentralAPIHandler.handlePostRequest(apiUrl, {
        enterpriseId,
        teamId,
        userId,
        name,
      });

      return response.data?.encoded;
    },
    [enterpriseId, teamId, userId]
  );

  // Handle API key reset
  const handleResetApiKey = useCallback(
    async (name: string): Promise<string> => {
      const apiUrl = `${process.env.APP_BACKEND_BASEURL}/user-management/v1/token/generate`;
      const response = await CentralAPIHandler.handlePostRequest(apiUrl, {
        enterpriseId,
        teamId,
        userId,
        name,
      });

      return response.data?.encoded;
    },
    [enterpriseId, teamId, userId]
  );

  const handleGenerateKey = async (keyName: string): Promise<string> => {
    setIsGenerating(true);
    try {
      const apiKey = await handleGenerateApiKey(keyName);
      const apiKeyData: ApiKeyData = {
        name: keyName,
        apiKey,
        dateCreated: new Date().toISOString(),
        createdBy: userEmail || 'Unknown',
      };
      onApiKeyGenerated?.(apiKeyData);
      return apiKey;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenGenerateModal = () => {
    setShowGenerateModal(true);
  };

  const handleCloseGenerateModal = () => {
    setShowGenerateModal(false);
  };

  const handleResetKey = async () => {
    if (!existingApiKey) return;

    try {
      setIsGenerating(true);
      const newApiKey = await handleResetApiKey(existingApiKey.name);
      const updatedApiKeyData: ApiKeyData = {
        ...existingApiKey,
        apiKey: newApiKey,
        dateCreated: new Date().toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };
      onApiKeyGenerated?.(updatedApiKeyData);
      toast.success('API key has been reset successfully');
    } catch (error) {
      toast.error('Failed to reset API key. Please try again.');
    } finally {
      setIsGenerating(false);
      setShowResetModal(false);
    }
  };

  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const handleCloseModal = () => {
    setShowResetModal(false);
  };

  const handleCopyKey = async () => {
    if (!existingApiKey?.apiKey) return;

    try {
      await navigator.clipboard.writeText(existingApiKey.apiKey);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const truncateApiKey = (key: string) => {
    if (key.length <= 20) return key;
    return `${key.substring(0, 15)}...`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col pt-11">
      {/* Row with back button and Spyne logo on same line */}
      <div className="mb-3 flex w-full items-start">
        <div className="flex flex-1 justify-center">
          <div className="relative flex h-[200px] w-[200px] items-center justify-center">
            <Image
              src="https://spyne-static.s3.us-east-1.amazonaws.com/spyne-shimmer.png"
              alt="Spyne"
              width={200}
              height={200}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="w-12 flex-shrink-0" />
      </div>

      {/* Title */}
      <h2 className="mb-8 text-center text-[28px] font-bold text-black">
        You will use Spyne&apos;s Public API for inventory & media
      </h2>

      {/* Centered content */}
      <div className="mx-auto flex max-h-[164px] w-full max-w-[1000px] flex-1 flex-col items-center">
        <div className="w-full rounded-2xl border border-black/10 p-4">
          <div className="mb-4 flex flex-col items-start justify-between">
            <div className="flex w-full flex-row justify-between pr-4">
              <h3 className="mb-1 text-lg font-semibold text-black">
                API Keys
              </h3>
              <a
                href="https://docs.spyne.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-light flex items-center gap-1 whitespace-nowrap text-sm font-medium transition-colors hover:text-blue-700"
              >
                Read Documentation
                <HiOutlineExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm font-normal leading-relaxed text-black/60">
              Streamline your integration process with our API keys. Generate
              unique key to easily access our Public APIs and accelerate your
              workflow.
            </p>
          </div>

          {existingApiKey ? (
            <div className="w-full">
              <div className="mb-2 grid grid-cols-5 rounded-lg bg-gray-50 text-sm font-medium text-black/50">
                <div className="px-6 py-2">Name</div>
                <div className="px-6 py-2">API Key</div>
                <div className="px-6 py-2">Date Created</div>
                <div className="px-6 py-2">Created By</div>
                <div className="px-6 py-2">Action</div>
              </div>

              <div className="grid grid-cols-5 items-center justify-start rounded-xl bg-white outline outline-1 outline-offset-[-0.5px] outline-gray-100">
                <div className="px-6 py-2 text-sm font-medium text-black/80">
                  {existingApiKey.name}
                </div>
                <div className="flex items-center gap-2 px-6 py-2">
                  <span className="text-sm text-black/70">
                    {truncateApiKey(existingApiKey.apiKey)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="rounded p-1 transition-colors hover:bg-gray-100"
                  >
                    <IoCopyOutline className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="px-6 py-2 text-sm text-black/70">
                  {existingApiKey.dateCreated}
                </div>
                <div className="px-6 py-2 text-sm text-black/70">
                  {existingApiKey.createdBy}
                </div>
                <div className="px-6 py-2">
                  <button
                    type="button"
                    onClick={handleResetClick}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-sm font-semibold text-black transition-colors hover:text-blue-700 disabled:opacity-50"
                  >
                    <IoRefresh
                      className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
                      strokeWidth={2}
                    />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenGenerateModal}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg border border-black px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <IoRefresh className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate API Key'
              )}
            </button>
          )}
        </div>
      </div>

      {showResetModal && (
        <ResetApiKeyModal
          onClose={handleCloseModal}
          onResetKey={handleResetKey}
          isGenerating={isGenerating}
        />
      )}

      <GenerateApiKeyModal
        isOpen={showGenerateModal}
        onClose={handleCloseGenerateModal}
        onGenerate={handleGenerateKey}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default PublicApiScreen;
