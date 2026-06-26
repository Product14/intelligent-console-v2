import React from 'react';

// @ts-ignore
import SVG from '@spyne-console/design-system/svg';

import { ChannelSelector } from './components/channel-selector';
import { FormatSelector } from './components/format-selector';
import { PreviewSection } from './components/preview-section';
import { PublishTypeSelector } from './components/publish-type-selector';
import { PublishingTypeSection } from './components/publishing-type-section';
import { VideoDetails } from './components/video-details';
import { useYoutubeForm } from './hooks/use-youtube-form';
import { YoutubeModalProps } from './types';

export const YoutubeModal: React.FC<YoutubeModalProps> = ({
  isOpen,
  onClose,
  onCloseAll,
  vehicleData,
  showToast,
}) => {
  const {
    formData,
    updateFormData,
    isGenerating,
    isSubmitting,
    submitFailed,
    videoUrlMissing,
    isFetchingVideoUrl,
    isGeneratingThreeSixty,
    threeSixtyUrl,
    isUploadingThumbnail,
    customThumbnailUrl,
    thumbnailUploadError,
    isLoadingConfig,
    availableChannels,
    availablePublishTypes,
    availableFormats,
    disabledFormats,
    showChannelDropdown,
    setShowChannelDropdown,
    channelCustomThumbnail,
    heroAnglePreviewUrl,
    selectedThumbnail,
    setSelectedThumbnail,
    togglePublishType,
    handleChannelSelect,
    toggleFormatSelect,
    handleGenerateDescription,
    handleThumbnailUpload,
    handleClearCustomThumbnail,
    handleGenerateThreeSixtyVideo,
    handlePublishNow,
    handleScheduleMode,
    handleScheduleDateChange,
    scheduleError,
    scheduleInPast,
    handleSubmit,
    handleBack,
    handleClose,
  } = useYoutubeForm(isOpen, vehicleData, onClose, onCloseAll, showToast);

  if (!isOpen) return null;

  const is360SpinSelected = formData.publishTypes.some(
    (t) => t.type === '360_spin' && t.selected && !t.disabled
  );

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <SVG iconName="youtube" width={24} height={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Publish to Youtube
              </h2>
              <p className="text-sm text-gray-500">
                Follow these steps to post and edit post
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <SVG iconName="cross" width={24} height={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6">
          {isLoadingConfig ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 [border-top-color:theme(colors.blue.light)]" />
              <p className="text-sm text-gray-500">Loading channel config...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Section 1: Platform & Format */}
              <div className="space-y-6">
                <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
                  Platform & Format
                </h3>
                <ChannelSelector
                  selectedChannel={formData.selectedChannel}
                  availableChannels={availableChannels}
                  showDropdown={showChannelDropdown}
                  onToggleDropdown={() =>
                    setShowChannelDropdown(!showChannelDropdown)
                  }
                  onSelect={handleChannelSelect}
                />
                <PublishTypeSelector
                  publishTypes={availablePublishTypes}
                  onToggle={togglePublishType}
                />
                <FormatSelector
                  availableFormats={availableFormats}
                  selectedFormats={formData.selectedFormats}
                  disabledFormats={disabledFormats}
                  onToggle={toggleFormatSelect}
                />
              </div>

              {/* Section 2: Video Details */}
              <VideoDetails
                title={formData.title}
                description={formData.description}
                isGenerating={isGenerating}
                isUploadingThumbnail={isUploadingThumbnail}
                channelCustomThumbnail={channelCustomThumbnail}
                heroAnglePreviewUrl={heroAnglePreviewUrl}
                customThumbnailUrl={customThumbnailUrl}
                thumbnailUploadError={thumbnailUploadError}
                selectedThumbnail={selectedThumbnail}
                onTitleChange={(value) => updateFormData({ title: value })}
                onDescriptionChange={(value) =>
                  updateFormData({ description: value })
                }
                onGenerateDescription={handleGenerateDescription}
                onThumbnailSelect={setSelectedThumbnail}
                onThumbnailUpload={handleThumbnailUpload}
                onCustomThumbnailRemove={handleClearCustomThumbnail}
              />

              {/* Section 3: Publishing Type */}
              <PublishingTypeSection
                scheduledDate={formData.scheduledDate}
                scheduleError={scheduleError}
                onPublishNow={handlePublishNow}
                onSchedule={handleScheduleMode}
                onDateChange={handleScheduleDateChange}
              />

              {/* Section 4: Preview */}
              <PreviewSection
                title={formData.title}
                description={formData.description}
                tags={formData.tags}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-start justify-between gap-4 border-t border-gray-200 p-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              {is360SpinSelected && !threeSixtyUrl && (
                <button
                  type="button"
                  onClick={handleGenerateThreeSixtyVideo}
                  disabled={isGeneratingThreeSixty}
                  className="bg-blue-light hover:bg-blue-light/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isGeneratingThreeSixty && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {isGeneratingThreeSixty
                    ? 'Generating 360 video...'
                    : 'Generate 360 Video'}
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isLoadingConfig ||
              isSubmitting ||
              isFetchingVideoUrl ||
              isGeneratingThreeSixty ||
              videoUrlMissing ||
              scheduleInPast
            }
            title={
              is360SpinSelected && !threeSixtyUrl
                ? 'Generate 360 video before submitting'
                : scheduleInPast
                  ? 'Schedule time must be in the future'
                  : videoUrlMissing
                    ? 'Video URL not present'
                    : undefined
            }
            className={`flex shrink-0 items-center gap-2 self-start rounded-lg px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              videoUrlMissing || submitFailed
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-light hover:bg-blue-light/80'
            }`}
          >
            {isSubmitting && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isSubmitting
              ? 'Publishing...'
              : videoUrlMissing
                ? 'Video URL not present'
                : submitFailed
                  ? 'Failed'
                  : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};
