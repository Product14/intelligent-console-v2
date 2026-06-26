import React, { useRef, useState } from 'react';

import {
  ApiThumbnail,
  HERO_ANGLE_THUMBNAIL_PLACEHOLDER,
  THUMBNAIL_SELECTION,
} from '../types';

const MAX_DESCRIPTION_CHARS = 2200;

interface VideoDetailsProps {
  title: string;
  description: string;
  isGenerating: boolean;
  isUploadingThumbnail: boolean;
  channelCustomThumbnail: ApiThumbnail | null;
  heroAnglePreviewUrl?: string;
  customThumbnailUrl?: string;
  thumbnailUploadError?: string;
  selectedThumbnail: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGenerateDescription: () => void;
  onThumbnailSelect: (type: string) => void;
  onThumbnailUpload: (file: File) => void;
  onCustomThumbnailRemove: () => void;
}

export const VideoDetails: React.FC<VideoDetailsProps> = ({
  title,
  description,
  isGenerating,
  isUploadingThumbnail,
  channelCustomThumbnail,
  heroAnglePreviewUrl = '',
  customThumbnailUrl,
  thumbnailUploadError,
  selectedThumbnail,
  onTitleChange,
  onDescriptionChange,
  onGenerateDescription,
  onThumbnailSelect,
  onThumbnailUpload,
  onCustomThumbnailRemove,
}) => {
  const descriptionLength = description.length;
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const [isThumbnailDragOver, setIsThumbnailDragOver] = useState(false);

  const handleThumbnailFile = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) onThumbnailUpload(file);
  };

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        Video Details
      </h3>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          Add Video Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter video title"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          Add Video Description
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= MAX_DESCRIPTION_CHARS) {
              onDescriptionChange(e.target.value);
            }
          }}
          placeholder="Add a caption, or try a description and then use Generate..."
          rows={4}
          maxLength={MAX_DESCRIPTION_CHARS}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
        />
        <div className="flex items-center justify-end gap-4">
          <span
            className={`text-xs ${
              descriptionLength > MAX_DESCRIPTION_CHARS * 0.9
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            {descriptionLength} / {MAX_DESCRIPTION_CHARS}
          </span>
          <button
            type="button"
            onClick={onGenerateDescription}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            {isGenerating ? 'Generating...' : 'Regenerate with AI'}
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">Thumbnail</label>
        <div className="flex items-start gap-6">
          <button
            type="button"
            onClick={() => onThumbnailSelect(THUMBNAIL_SELECTION.HERO_ANGLE)}
            className={`flex h-36 w-36 flex-col overflow-hidden rounded-lg border-2 transition-all ${
              selectedThumbnail === THUMBNAIL_SELECTION.HERO_ANGLE ||
              selectedThumbnail === 'api'
                ? 'border-blue-light'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="relative flex flex-1 items-center justify-center bg-gray-100">
              {heroAnglePreviewUrl ? (
                <img
                  src={heroAnglePreviewUrl}
                  alt="Hero angle"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={HERO_ANGLE_THUMBNAIL_PLACEHOLDER}
                  alt="Hero angle"
                  className="h-12 w-12 object-contain opacity-60"
                />
              )}
            </div>
            <span
              className={`py-1.5 text-center text-xs font-medium ${
                selectedThumbnail === THUMBNAIL_SELECTION.HERO_ANGLE ||
                selectedThumbnail === 'api'
                  ? 'text-blue-light'
                  : 'text-gray-700'
              }`}
            >
              Hero Angle
            </span>
          </button>
          {channelCustomThumbnail?.assetUrl && (
            <button
              type="button"
              onClick={() =>
                onThumbnailSelect(THUMBNAIL_SELECTION.CHANNEL_CUSTOM)
              }
              className={`flex h-36 w-36 flex-col overflow-hidden rounded-lg border-2 transition-all ${
                selectedThumbnail === THUMBNAIL_SELECTION.CHANNEL_CUSTOM
                  ? 'border-blue-light'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="relative flex-1 bg-gray-100">
                <img
                  src={channelCustomThumbnail.assetUrl}
                  alt="Channel custom thumbnail"
                  className="h-full w-full object-contain"
                />
              </div>
              <span
                className={`py-1.5 text-center text-xs font-medium ${
                  selectedThumbnail === THUMBNAIL_SELECTION.CHANNEL_CUSTOM
                    ? 'text-blue-light'
                    : 'text-gray-700'
                }`}
              >
                Custom
              </span>
            </button>
          )}
          {customThumbnailUrl && (
            <div
              className={`relative flex h-36 w-36 flex-col overflow-hidden rounded-lg border-2 transition-all ${
                selectedThumbnail === THUMBNAIL_SELECTION.UPLOADED
                  ? 'border-blue-light'
                  : 'border-gray-300'
              }`}
            >
              <button
                type="button"
                aria-label="Remove uploaded thumbnail"
                className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md ring-1 ring-gray-200 transition hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomThumbnailRemove();
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onThumbnailSelect(THUMBNAIL_SELECTION.UPLOADED)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onThumbnailSelect(THUMBNAIL_SELECTION.UPLOADED);
                  }
                }}
                className="focus-visible:ring-blue-light flex flex-1 cursor-pointer flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <div className="relative flex-1 bg-gray-100">
                  <img
                    src={customThumbnailUrl}
                    alt="custom"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span
                  className={`py-1.5 text-center text-xs font-medium capitalize ${
                    selectedThumbnail === THUMBNAIL_SELECTION.UPLOADED
                      ? 'text-blue-light'
                      : 'text-gray-700'
                  }`}
                >
                  Uploaded
                </span>
              </div>
            </div>
          )}
          {!customThumbnailUrl && (
            <div className="flex flex-col items-center gap-2">
              <input
                ref={thumbnailFileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload thumbnail image"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleThumbnailFile(file);
                  e.currentTarget.value = '';
                }}
              />
              <div
                role="button"
                tabIndex={isUploadingThumbnail ? -1 : 0}
                onClick={() => {
                  if (!isUploadingThumbnail)
                    thumbnailFileInputRef.current?.click();
                }}
                onKeyDown={(e) => {
                  if (
                    !isUploadingThumbnail &&
                    (e.key === 'Enter' || e.key === ' ')
                  ) {
                    e.preventDefault();
                    thumbnailFileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isUploadingThumbnail) setIsThumbnailDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsThumbnailDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsThumbnailDragOver(false);
                  if (isUploadingThumbnail) return;
                  const file = e.dataTransfer.files?.[0];
                  handleThumbnailFile(file);
                }}
                className={`flex w-36 cursor-pointer flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 ${
                  isUploadingThumbnail ? 'cursor-not-allowed' : ''
                }`}
              >
                <div
                  className={`flex h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 transition-colors ${
                    isUploadingThumbnail
                      ? 'border-purple-200 bg-purple-50/50 opacity-80'
                      : isThumbnailDragOver
                        ? 'border-purple-400 bg-purple-100/60'
                        : 'border-purple-200 bg-purple-50/40 hover:border-purple-300 hover:bg-purple-50/70'
                  }`}
                >
                  {isUploadingThumbnail ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500" />
                      <span className="text-sm text-gray-600">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200">
                      <svg
                        className="h-9 w-9 text-purple-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white shadow-sm">
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M12 19V5M12 5l4 4m-4-4l-4 4" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
                {!isUploadingThumbnail && (
                  <span className="text-sm font-medium text-gray-700">
                    Upload
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {thumbnailUploadError && (
          <p className="text-xs text-red-500">{thumbnailUploadError}</p>
        )}
      </div>
    </div>
  );
};
