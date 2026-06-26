import { Button } from '@spyne-console/design-system';

import React, { useMemo, useState } from 'react';

import {
  ArrowRightAlt,
  Chevron,
  PlayArrow,
} from '@spyne-console/design-system/icons';
import { threeSixty } from '@spyne-console/design-system/icons/urls';
import ModalWrapper from '@spyne-console/design-system/modal/modal-wrapper';

import { createNewImage } from '@spyne-console/utils/config';

interface ExistingParentVinModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  vehicleMedia?: any;
  proceedWithCurrent?: () => void;
  proceedWithMaster?: () => void;
  isLoading?: boolean;
  cloneApprovalStatusLoading?: boolean;
}

type PreviewTile =
  | {
      type: 'spin';
      key: string;
      imageUrl: string;
    }
  | {
      type: 'video';
      key: string;
      imageUrl: string;
    }
  | {
      type: 'photo';
      key: string;
      imageUrl: string;
      alt: string;
    };

const getValue = (...values: any[]) => values.find(Boolean) || '';

const getMediaRecord = (vehicleMedia: any) =>
  vehicleMedia?.mediaRecord || vehicleMedia || {};

const getImageUrl = (image: any) =>
  getValue(
    image?.output_image,
    image?.outputImage,
    image?.outputImageUrl,
    image?.imageUrl,
    image?.thumbnailUrl,
    image?.url,
    image?.input_image,
    image?.inputImage
  );

const getProcessingStatus = (mediaRecord: any, key: string) =>
  mediaRecord?.status?.statusDetails?.[key]?.processingStatus?.toLowerCase() ||
  '';

const isDone = (status: string) => status === 'done' || status === 'qc_done';

const getCatalogImages = (mediaRecord: any) => {
  const images =
    mediaRecord?.outputData?.catalog?.processedData?.image_data || [];

  return images
    .filter((image: any) => {
      const status = image?.status?.toLowerCase?.();
      return getImageUrl(image) && (!status || status === 'done');
    })
    .sort((first: any, second: any) => {
      const firstFrame = Number(first?.frame_no || 0);
      const secondFrame = Number(second?.frame_no || 0);
      return firstFrame - secondFrame;
    });
};

const buildPreviewData = (vehicleMedia: any) => {
  const mediaRecord = getMediaRecord(vehicleMedia);
  const catalogImages = getCatalogImages(mediaRecord);
  const catalogCount =
    Number(
      mediaRecord?.outputData?.catalog?.processedData?.total_frame_count || 0
    ) || catalogImages.length;
  const firstCatalogImageUrl = getImageUrl(catalogImages?.[0]);

  const spinThumbnailUrl = getValue(
    mediaRecord?.outputData?.spin?.processedData?.thumbnailUrl,
    mediaRecord?.thumbnail?.spin?.outputThumbnailUrl,
    mediaRecord?.thumbnail?.spin?.inputThumbnailUrl,
    firstCatalogImageUrl
  );
  const spinIframeUrl =
    mediaRecord?.outputData?.spin?.processedData?.iFrameUrl || '';
  const hasSpin =
    isDone(getProcessingStatus(mediaRecord, 'spin')) ||
    Boolean(spinIframeUrl) ||
    Boolean(mediaRecord?.outputData?.spin?.skuId);

  const videoThumbnailUrl = getValue(
    mediaRecord?.outputData?.featureVideo?.processedData?.outputThumbnailUrl,
    mediaRecord?.outputData?.featureVideo?.processedData?.inputThumbnailUrl,
    mediaRecord?.thumbnail?.featureVideo?.outputThumbnailUrl,
    mediaRecord?.thumbnail?.featureVideo?.inputThumbnailUrl
  );
  const videoIframeUrl =
    mediaRecord?.outputData?.featureVideo?.processedData?.iframe_url || '';
  const hasFeatureVideo =
    isDone(getProcessingStatus(mediaRecord, 'featureVideo')) ||
    Boolean(videoIframeUrl) ||
    Boolean(mediaRecord?.outputData?.featureVideo?.skuId);

  const tiles: PreviewTile[] = [];

  if (hasSpin) {
    tiles.push({
      type: 'spin',
      key: 'smart-match-spin',
      imageUrl: spinThumbnailUrl,
    });
  }

  if (hasFeatureVideo) {
    tiles.push({
      type: 'video',
      key: 'smart-match-feature-video',
      imageUrl: videoThumbnailUrl,
    });
  }

  catalogImages.forEach((image: any, index: number) => {
    tiles.push({
      type: 'photo',
      key: image?.image_id || `smart-match-photo-${index}`,
      imageUrl: getImageUrl(image),
      alt: `Smart Match photo ${index + 1}`,
    });
  });

  return {
    catalogCount,
    hasSpin,
    hasFeatureVideo,
    tiles,
  };
};

const FALLBACK_IMAGE = createNewImage(
  'https://spyne-static.s3.us-east-1.amazonaws.com/failedToLoadImage.svg',
  '200x'
);

const MediaThumbnail = ({ tile }: { tile: PreviewTile }) => {
  const hasImage = Boolean(tile.imageUrl);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-[#2E2E2E]">
      {hasImage && (
        <img
          src={createNewImage(tile.imageUrl, '400x')}
          alt={tile.type === 'photo' ? tile.alt : tile.type}
          className="h-full w-full object-cover"
          loading="eager"
        />
      )}

      {tile.type === 'spin' && (
        <div className="absolute right-1 top-1 rounded-md px-2 py-1">
          <img
            src={createNewImage(threeSixty, '200x')}
            className="h-6 w-6"
            alt="360"
            width={24}
            height={24}
          />
        </div>
      )}

      {tile.type === 'video' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-white">
          <PlayArrow className="h-8 w-8 fill-white" />
          <span className="text-sm font-medium">Feature Video</span>
        </div>
      )}
    </div>
  );
};

export const ExistingParentVinModal = ({
  isOpen,
  setIsOpen,
  vehicleMedia,
  proceedWithCurrent = () => {},
  proceedWithMaster = () => {},
  isLoading = false,
  cloneApprovalStatusLoading = false,
}: ExistingParentVinModalProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  const previewData = useMemo(
    () => buildPreviewData(vehicleMedia),
    [vehicleMedia]
  );

  const foundItems = [
    previewData.catalogCount
      ? `${previewData.catalogCount} Photo${
          previewData.catalogCount > 1 ? 's' : ''
        }`
      : '',
    previewData.hasSpin ? '360 Spin' : '',
    previewData.hasFeatureVideo ? 'Video Tour' : '',
  ].filter(Boolean);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] !max-w-[724px] !rounded-2xl !p-0"
      allowClose={!isLoading}
    >
      <div className="flex w-full flex-col p-6">
        {/* Header */}
        <div className="mx-auto flex max-w-[440px] flex-col items-center gap-3 px-8 text-center sm:px-0">
          {isLoading ? (
            <>
              {/* Fetching Library */}
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-blue-600">
                  Fetching Smart Match...
                </span>
              </div>

              {/* Skeleton Title */}
              <div className="h-8 w-[320px] animate-pulse rounded-md bg-black/10 max-sm:h-7 max-sm:w-[260px]" />

              {/* Skeleton Subtitle */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-4 w-[280px] animate-pulse rounded bg-black/10 max-sm:w-[220px]" />
                <div className="h-4 w-[180px] animate-pulse rounded bg-black/10 max-sm:w-[140px]" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold leading-8 text-black/90 max-sm:text-xl">
                Found Smart Match Photos for this vehicle!
              </h2>

              <p className="text-base font-normal leading-6 text-black/60 max-sm:text-sm">
                You can choose to re-use or shoot seperately for this VIN
              </p>
            </>
          )}
        </div>

        {/* Media Section */}
        <div className="mt-6 flex max-h-[300px] flex-col rounded-xl border border-black/10 bg-[#FAFAFA] p-4">
          <div
            className={`flex items-center justify-between gap-3 ${
              !isLoading ? 'hover:cursor-pointer' : ''
            }`}
            onClick={() => {
              if (!isLoading) {
                setIsPreviewOpen((value) => !value);
              }
            }}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-[240px] animate-pulse rounded bg-black/10" />
                <div className="h-6 w-6 animate-pulse rounded-full bg-black/10" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-black/50">
                  Found:{' '}
                  <span className="font-semibold text-black/80">
                    {foundItems.length
                      ? foundItems.join(', ')
                      : 'Media available'}
                  </span>
                </p>

                <button
                  type="button"
                  aria-label={isPreviewOpen ? 'Collapse media' : 'Expand media'}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                >
                  <Chevron
                    className={`text-blue-light h-4 w-4 ${
                      isPreviewOpen ? '-rotate-90' : 'rotate-90'
                    }`}
                  />
                </button>
              </>
            )}
          </div>

          {(isLoading || isPreviewOpen) && (
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-video animate-pulse rounded-lg bg-black/10"
                    />
                  ))
                ) : previewData.tiles.length > 0 ? (
                  previewData.tiles.map((tile) => (
                    <MediaThumbnail key={tile.key} tile={tile} />
                  ))
                ) : (
                  <div className="col-span-full flex h-32 items-center justify-center rounded-lg bg-black/[0.03] text-sm font-medium text-black/50">
                    No preview media available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-11 flex w-full flex-col gap-4 max-sm:mt-6">
          {isLoading ? (
            <>
              <div className="h-12 w-full animate-pulse rounded-lg bg-black/10" />
              <div className="h-12 w-full animate-pulse rounded-lg bg-black/10" />
            </>
          ) : (
            <>
              <Button
                className="text-blue-light gap-1 py-3 font-semibold"
                icon={
                  <ArrowRightAlt className="fill-blue-light text-blue-light h-4 w-4" />
                }
                iconUrl={undefined}
                onClick={() => {
                  proceedWithCurrent();
                }}
                label="Upload media for this vehicle"
                iconPosition={'right'}
                type={'outline'}
                disabled={cloneApprovalStatusLoading}
              />

              <Button
                disabled={cloneApprovalStatusLoading}
                className="gap-1 py-3 font-semibold"
                icon={<ArrowRightAlt className="h-4 w-4" />}
                iconUrl={undefined}
                onClick={() => {
                  proceedWithMaster();
                }}
                label="Use Smart Match Photos"
                iconPosition={'right'}
              />
            </>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
