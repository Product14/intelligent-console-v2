import { useEffect, useState } from 'react';

import {
  fetchSkuVideoFamily,
  fetchYoutubeSocialConfig,
  generateDescription,
  getThreeSixtyDownloadStatus,
  publishToSocialMedia,
  requestThreeSixtyDownload,
  uploadYoutubeThumbnail,
} from '@spyne-console/actions/inventory/publishing';

import {
  ApiThumbnail,
  DEFAULT_PUBLISH_TYPES,
  THUMBNAIL_SELECTION,
  YOUTUBE_FORMATS,
  YoutubeFormData,
  YoutubePublishType,
} from '../types';

type SocialMediaContentFormat = {
  name?: string;
  url?: string;
  title?: string;
  description?: string;
};

type SocialMediaItem = {
  name?: string;
  thumbnail?: { type?: string; assetUrl?: string };
  contentFormat?: SocialMediaContentFormat[];
};

type RawMediaItem =
  | string
  | {
      name?: string;
      thumbnail?: { type?: string; assetUrl?: string };
      contentFormat?: Array<string | SocialMediaContentFormat>;
    };

const normalizeToken = (value?: string) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

const VIDEO_TOUR_MEDIA_TOKENS = new Set(['videotour']);
const THREE_SIXTY_MEDIA_TOKENS = new Set([
  'threesixty',
  '360',
  '360spin',
  'threesixtyspin',
]);
const isChannelCustomThumbnailType = (type?: string) => {
  const token = normalizeToken(type);
  return token === 'custom' || token === 'upload';
};

const parseChannelThumbnailConfig = (
  thumbnail?: { type?: string; assetUrl?: string } | null
): ApiThumbnail | null => {
  if (!thumbnail?.type || !isChannelCustomThumbnailType(thumbnail.type)) {
    return null;
  }
  return {
    type: 'custom',
    assetUrl: thumbnail.assetUrl || '',
  };
};

const normalizeThumbnailSelection = (
  selection: string,
  hasUploadedThumbnail: boolean
) => {
  if (selection === 'api') return THUMBNAIL_SELECTION.HERO_ANGLE;
  if (selection === 'custom') {
    return hasUploadedThumbnail
      ? THUMBNAIL_SELECTION.UPLOADED
      : THUMBNAIL_SELECTION.CHANNEL_CUSTOM;
  }
  return selection;
};

const mediaNameToType = (name?: string): YoutubePublishType['type'] | null => {
  const token = normalizeToken(name);
  if (!token) return null;
  // Backend can send names like "video-tour", "threesixty", "freeflow video".
  // Only support video-tour and threesixty for this publish flow.
  if (VIDEO_TOUR_MEDIA_TOKENS.has(token)) return 'video_tour';
  if (THREE_SIXTY_MEDIA_TOKENS.has(token)) return '360_spin';
  return null;
};

const mediaTypeToPayloadName = (type?: YoutubePublishType['type']) => {
  if (type === '360_spin') return 'threesixty';
  return 'video';
};

const formatNameToUi = (name?: string): 'video' | 'shorts' | null => {
  const token = normalizeToken(name);
  if (!token) return null;
  if (token.includes('short')) return 'shorts';
  if (token.includes('video')) return 'video';
  return null;
};

const isPastScheduleDate = (date: Date) => date.getTime() <= Date.now();

const getDefaultScheduleDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 1, 0, 0);
  return date;
};

/** VIN catalog hero shot for UI preview — not the channel template asset from social-config. */
const getHeroAnglePreviewUrl = (vehicleData: any): string => {
  const record = vehicleData?.vehicleMedia?.mediaRecord;
  const catalogThumb = record?.thumbnail?.catalog;
  return (
    catalogThumb?.outputThumbnailUrl ||
    catalogThumb?.inputThumbnailUrl ||
    vehicleData?.thumbnailUrl ||
    ''
  );
};

const normalizeContentFormats = (
  formats?: Array<string | SocialMediaContentFormat>
): SocialMediaContentFormat[] => {
  const list = Array.isArray(formats) ? formats : [];
  return list
    .map((format) => {
      if (typeof format === 'string') return { name: format };
      return {
        name: format?.name,
        url: format?.url,
        title: format?.title,
        description: format?.description,
      };
    })
    .filter((format) => !!format?.name);
};

const normalizeMediaItems = (
  media?: RawMediaItem[],
  channelFormats?: Array<string | SocialMediaContentFormat>,
  channelThumbnail?: { type?: string; assetUrl?: string }
): SocialMediaItem[] => {
  const list = Array.isArray(media) ? media : [];
  const fallbackFormats = normalizeContentFormats(channelFormats);
  return list
    .map((item) => {
      if (typeof item === 'string') {
        return {
          name: item,
          thumbnail: channelThumbnail,
          contentFormat: fallbackFormats,
        };
      }
      const itemFormats = normalizeContentFormats(item?.contentFormat);
      return {
        name: item?.name,
        thumbnail: item?.thumbnail || channelThumbnail,
        contentFormat: itemFormats.length > 0 ? itemFormats : fallbackFormats,
      };
    })
    .filter((item) => !!item?.name);
};

const getSelectedMediaItems = (
  channel: any,
  publishTypes: YoutubePublishType[]
): SocialMediaItem[] => {
  const mediaItems: SocialMediaItem[] = Array.isArray(channel?.media)
    ? channel.media
    : [];
  const selectedTypes = new Set(
    publishTypes.filter((p) => p.selected).map((p) => p.type)
  );
  const firstItemByType = new Map<
    YoutubePublishType['type'],
    SocialMediaItem
  >();

  mediaItems.forEach((item) => {
    const type = mediaNameToType(item.name);
    if (!type || !selectedTypes.has(type)) return;
    if (!firstItemByType.has(type)) {
      firstItemByType.set(type, item);
    }
  });

  return [...firstItemByType.values()];
};

const mergeAvailableFormats = (mediaItems: SocialMediaItem[]) => {
  const formatSet = new Set<'video' | 'shorts'>();
  mediaItems.forEach((item) => {
    const list = Array.isArray(item.contentFormat) ? item.contentFormat : [];
    list.forEach((cf) => {
      const fmt = formatNameToUi(cf.name);
      if (fmt) formatSet.add(fmt);
    });
  });
  const names = [...formatSet];
  return names.length > 0
    ? YOUTUBE_FORMATS.filter((f) => names.includes(f.type))
    : YOUTUBE_FORMATS;
};

const is360SpinSelected = (publishTypes: YoutubePublishType[]) =>
  publishTypes.some((t) => t.type === '360_spin' && t.selected && !t.disabled);

const resolveFormatsState = (
  publishTypes: YoutubePublishType[],
  selectedMediaItems: SocialMediaItem[],
  currentSelectedFormats: ('video' | 'shorts')[]
) => {
  let availableFormats = mergeAvailableFormats(selectedMediaItems);
  if (is360SpinSelected(publishTypes)) {
    availableFormats = availableFormats.filter((f) => f.type !== 'shorts');
  }

  const disabledFormats = YOUTUBE_FORMATS.filter(
    (f) => !availableFormats.some((m) => m.type === f.type)
  ).map((f) => f.type) as ('video' | 'shorts')[];

  let selectedFormats = currentSelectedFormats.filter((fmt) =>
    availableFormats.some((f) => f.type === fmt)
  );
  if (is360SpinSelected(publishTypes)) {
    selectedFormats = selectedFormats.filter((fmt) => fmt !== 'shorts');
  }
  if (selectedFormats.length === 0) {
    selectedFormats = [availableFormats[0]?.type || 'video'];
  }

  return { availableFormats, disabledFormats, selectedFormats };
};

const getFormatsForMediaItem = (
  item: SocialMediaItem,
  publishTypes: YoutubePublishType[],
  selectedFormats: ('video' | 'shorts')[]
): ('video' | 'shorts')[] => {
  if (mediaNameToType(item.name) === '360_spin') {
    return ['video'];
  }
  const formats =
    selectedFormats.length > 0 ? selectedFormats : (['video'] as const);
  if (is360SpinSelected(publishTypes)) {
    return formats.filter((fmt) => fmt !== 'shorts');
  }
  return [...formats];
};

const findContentFormatForItem = (
  item: SocialMediaItem | undefined,
  format: 'video' | 'shorts'
): SocialMediaContentFormat | undefined => {
  const list = Array.isArray(item?.contentFormat) ? item.contentFormat : [];
  return list.find((cf) => formatNameToUi(cf.name) === format) || list[0];
};

const hasVinDataForType = (
  type: YoutubePublishType['type'],
  vehicleData: any
): boolean => {
  const output = vehicleData?.outputProcessingList || {};
  const status = (output?.featureVideoStatus || output?.videoStatus || '')
    .toString()
    .toUpperCase();
  // Keep this strict: feature-video card should be enabled only when
  // processing flag explicitly indicates availability for current VIN.
  const hasFeatureVideo =
    output?.featureVideo === true &&
    (status === '' || status === 'DONE' || status === 'COMPLETED');
  const hasThreeSixty =
    (!!vehicleData?.mediaId &&
      (output?.spinStatus || output?.threeSixtyStatus || output?.status || '')
        .toString()
        .toUpperCase()
        .match(/DONE|COMPLETED|SUCCESS/) !== null) ||
    output?.spinDone === true ||
    output?.spinCompleted === true ||
    output?.spin === true ||
    output?.threeSixty === true ||
    output?.threeSixtySpin === true ||
    output?.is360 === true;

  if (type === '360_spin') return hasThreeSixty;
  // video_tour relies on feature-video output
  return hasFeatureVideo;
};

export const useYoutubeForm = (
  isOpen: boolean,
  vehicleData: any,
  onClose: () => void,
  onCloseAll?: () => void,
  showToast?: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void
) => {
  const effectiveVehicleData = {
    ...vehicleData,
    vin:
      vehicleData?.vin ||
      vehicleData?.vinId ||
      vehicleData?.vehicleMetadata?.vehicleSnap?.vin?.value,
    outputProcessingList:
      vehicleData?.outputProcessingList ||
      vehicleData?.vehicleMedia?.mediaRecord?.outputProcessingList ||
      {},
    mediaChildRelations:
      vehicleData?.mediaChildRelations ||
      vehicleData?.vehicleMedia?.mediaRecord?.mediaChildRelations ||
      {},
  };

  const vehicleMediaRecord = effectiveVehicleData?.vehicleMedia?.mediaRecord;
  const fallbackFeatureVideoUrl =
    vehicleMediaRecord?.outputData?.featureVideo?.processedData?.output_video ||
    vehicleMediaRecord?.outputData?.featureVideo?.processedData?.video_url ||
    vehicleMediaRecord?.outputData?.featureVideo?.processedData?.iframe_url ||
    vehicleMediaRecord?.outputData?.featureVideo?.processedData?.iFrameUrl ||
    effectiveVehicleData?.mediaUrl;

  const INITIAL_FORM: YoutubeFormData = {
    selectedChannel: null,
    publishTypes: DEFAULT_PUBLISH_TYPES,
    selectedFormats: ['video'],
    title: '',
    description: '',
    tags: [],
    thumbnail: null,
    visibility: 'public',
  };

  const [formData, setFormData] = useState<YoutubeFormData>(INITIAL_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [availableChannels, setAvailableChannels] = useState<any[]>([]);
  const [availablePublishTypes, setAvailablePublishTypes] = useState<
    YoutubePublishType[]
  >(DEFAULT_PUBLISH_TYPES);
  const [availableFormats, setAvailableFormats] = useState(YOUTUBE_FORMATS);
  const [disabledFormats, setDisabledFormats] = useState<
    ('video' | 'shorts')[]
  >([]);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [channelCustomThumbnail, setChannelCustomThumbnail] =
    useState<ApiThumbnail | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>(
    THUMBNAIL_SELECTION.HERO_ANGLE
  );
  const [skuVideos, setSkuVideos] = useState<any[]>([]);
  const [isFetchingVideoUrl, setIsFetchingVideoUrl] = useState(false);
  const [isGeneratingThreeSixty, setIsGeneratingThreeSixty] = useState(false);
  const [threeSixtyUrl, setThreeSixtyUrl] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState('');
  const [thumbnailUploadError, setThumbnailUploadError] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const applyChannelThumbnailConfig = (
    thumbnail?: { type?: string; assetUrl?: string } | null,
    options?: { preserveUserUpload?: boolean }
  ) => {
    const channelCustom = parseChannelThumbnailConfig(thumbnail);
    setChannelCustomThumbnail(channelCustom);
    setSelectedThumbnail((previousSelection) => {
      if (options?.preserveUserUpload) {
        const previous = normalizeThumbnailSelection(
          previousSelection,
          !!customThumbnailUrl
        );
        if (previous === THUMBNAIL_SELECTION.UPLOADED && customThumbnailUrl) {
          return THUMBNAIL_SELECTION.UPLOADED;
        }
      }
      if (channelCustom?.assetUrl) {
        return THUMBNAIL_SELECTION.CHANNEL_CUSTOM;
      }
      return THUMBNAIL_SELECTION.HERO_ANGLE;
    });
  };

  const getCurrentUserId = () => {
    try {
      const user = localStorage.getItem('userDetails');
      if (!user) return '';
      const parsed = JSON.parse(user);
      return parsed?.userId || '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (
      !(
        effectiveVehicleData?.enterpriseId &&
        effectiveVehicleData?.teamId &&
        effectiveVehicleData?.vin
      )
    ) {
      setIsLoadingConfig(false);
      return;
    }

    fetchYoutubeSocialConfig({
      enterpriseId: effectiveVehicleData.enterpriseId,
      teamId: effectiveVehicleData.teamId,
      vin: effectiveVehicleData.vin,
    })
      .then((config: any) => {
        const channelsData = config?.data?.channels || config?.channels || [];
        if (channelsData.length > 0) {
          const channels = channelsData.map((ch: any) => ({
            id: ch.channelId,
            name: ch.channelName,
            avatar: '',
            thumbnail: ch.thumbnail,
            media: normalizeMediaItems(
              ch.media,
              ch.contentFormat,
              ch.thumbnail
            ),
            title: ch.title || '',
            description: ch.description || '',
          }));
          setAvailableChannels(channels);
          applyChannelDefaults(channels[0]);
        } else {
          setAvailableChannels([]);
          setAvailablePublishTypes([]);
          setAvailableFormats([]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingConfig(false));
  }, [
    isOpen,
    effectiveVehicleData?.enterpriseId,
    effectiveVehicleData?.teamId,
    effectiveVehicleData?.vin,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const featureVideoEnabled =
      effectiveVehicleData?.outputProcessingList?.featureVideo === true;
    const skuId = effectiveVehicleData?.mediaChildRelations?.featureVideo?.id;
    if (!featureVideoEnabled || !skuId) return;

    setIsFetchingVideoUrl(true);
    fetchSkuVideoFamily({
      skuId,
      dealerVinId: effectiveVehicleData?.dealerVinId,
    })
      .then((videos: any[]) => setSkuVideos(videos))
      .catch(() => setSkuVideos([]))
      .finally(() => setIsFetchingVideoUrl(false));
  }, [
    isOpen,
    effectiveVehicleData?.outputProcessingList?.featureVideo,
    effectiveVehicleData?.mediaChildRelations?.featureVideo?.id,
  ]);

  const getVideoUrlForFormat = (
    videos: any[],
    format: string
  ): string | undefined => {
    const doneVideos = videos.filter((v) => v.processedData?.status === 'done');
    if (format === 'shorts') {
      const portrait = doneVideos.find(
        (v) => v.processedData?.view_mode === 'portrait'
      );
      const landscape = doneVideos.find(
        (v) => v.processedData?.view_mode === 'landscape'
      );
      return (
        portrait?.processedData?.video_url ||
        landscape?.processedData?.video_url
      );
    }
    const landscape = doneVideos.find(
      (v) => v.processedData?.view_mode === 'landscape'
    );
    const portrait = doneVideos.find(
      (v) => v.processedData?.view_mode === 'portrait'
    );
    return (
      landscape?.processedData?.video_url || portrait?.processedData?.video_url
    );
  };

  const applyChannelDefaults = (channel: any) => {
    updateFormData({ selectedChannel: channel });

    const mediaItems: SocialMediaItem[] = Array.isArray(channel.media)
      ? channel.media
      : [];

    if (!mediaItems.length) {
      setAvailablePublishTypes([]);
      setAvailableFormats(YOUTUBE_FORMATS);
      setDisabledFormats(['video', 'shorts']);
      updateFormData({
        title: channel?.title || '',
        description: channel?.description || '',
        selectedFormats: ['video'],
        publishTypes: [],
      });
      setCustomThumbnailUrl('');
      setThumbnailUploadError('');
      setChannelCustomThumbnail(null);
      setSelectedThumbnail(THUMBNAIL_SELECTION.HERO_ANGLE);
      return;
    }

    const filteredTypes = DEFAULT_PUBLISH_TYPES.filter((t) =>
      mediaItems.some((item) => mediaNameToType(item.name) === t.type)
    ).map((t) => ({
      ...t,
      disabled: !hasVinDataForType(t.type, effectiveVehicleData),
      selected: false,
    }));
    const firstEnabledIndex = filteredTypes.findIndex((t) => !t.disabled);
    if (firstEnabledIndex >= 0) {
      filteredTypes[firstEnabledIndex].selected = true;
    }
    setAvailablePublishTypes(filteredTypes);
    updateFormData({ publishTypes: filteredTypes });

    const selectedMediaItems = getSelectedMediaItems(channel, filteredTypes);
    const { availableFormats, disabledFormats, selectedFormats } =
      resolveFormatsState(filteredTypes, selectedMediaItems, ['video']);
    setAvailableFormats(availableFormats);
    setDisabledFormats(disabledFormats);

    updateFormData({
      selectedFormats,
      title: channel?.title || '',
      description: channel?.description || '',
    });
    setCustomThumbnailUrl('');
    setThumbnailUploadError('');
    applyChannelThumbnailConfig(
      selectedMediaItems[0]?.thumbnail || channel?.thumbnail
    );

    console.info('[YouTube Publish Modal] Options prepared', {
      channelId: channel?.id,
      channelName: channel?.name,
      whatToPublish: filteredTypes.map((type) => ({
        type: type.type,
        selected: type.selected,
        disabled: !!type.disabled,
      })),
      formats: availableFormats.map((format) => format.type),
      disabledFormats,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    console.info('[YouTube Publish Modal] Options shown on UI', {
      whatToPublish: availablePublishTypes.map((type) => ({
        type: type.type,
        selected: type.selected,
        disabled: !!type.disabled,
      })),
      formats: availableFormats.map((format) => format.type),
      disabledFormats,
    });
  }, [isOpen, availablePublishTypes, availableFormats, disabledFormats]);

  const updateFormData = (updates: Partial<YoutubeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const togglePublishType = (typeToSelect: string) => {
    const clicked = availablePublishTypes.find((t) => t.type === typeToSelect);
    if (clicked?.disabled) return;
    const updated = availablePublishTypes.map((t) =>
      t.type === typeToSelect ? { ...t, selected: !t.selected } : t
    );
    if (updated.filter((t) => t.selected && !t.disabled).length === 0) return;
    setAvailablePublishTypes(updated);

    const selectedChannel = formData.selectedChannel as any;
    const selectedMediaItems = getSelectedMediaItems(selectedChannel, updated);
    const { availableFormats, disabledFormats, selectedFormats } =
      resolveFormatsState(
        updated,
        selectedMediaItems,
        formData.selectedFormats
      );
    setAvailableFormats(availableFormats);
    setDisabledFormats(disabledFormats);
    updateFormData({
      publishTypes: updated,
      selectedFormats,
      title: selectedChannel?.title || '',
      description: selectedChannel?.description || '',
    });
    applyChannelThumbnailConfig(
      selectedMediaItems[0]?.thumbnail || selectedChannel?.thumbnail,
      { preserveUserUpload: true }
    );
  };

  const handleChannelSelect = (channel: any) => {
    applyChannelDefaults(channel);
    setShowChannelDropdown(false);
  };

  const toggleFormatSelect = (formatType: string) => {
    const format = formatType as 'video' | 'shorts';
    if (disabledFormats.includes(format)) return;
    const next = formData.selectedFormats.includes(format)
      ? formData.selectedFormats.filter((f) => f !== format)
      : [...formData.selectedFormats, format];
    if (next.length === 0) return;
    const selectedMediaItems = getSelectedMediaItems(
      formData.selectedChannel,
      formData.publishTypes
    );
    let contentFormat: SocialMediaContentFormat | undefined;
    for (const item of selectedMediaItems) {
      const cf = findContentFormatForItem(item, format);
      if (cf) {
        contentFormat = cf;
        break;
      }
    }
    updateFormData({
      selectedFormats: next,
      title:
        contentFormat?.title || (formData.selectedChannel as any)?.title || '',
      description:
        contentFormat?.description ||
        (formData.selectedChannel as any)?.description ||
        '',
    });
    applyChannelThumbnailConfig(
      selectedMediaItems[0]?.thumbnail ||
        (formData.selectedChannel as any)?.thumbnail,
      { preserveUserUpload: true }
    );
  };

  const handleGenerateDescription = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const generated = await generateDescription({
        description: formData.description,
      });
      if (generated) updateFormData({ description: generated });
    } catch (error) {
      console.error('Failed to generate description:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    if (!file || isUploadingThumbnail) return;
    if (!effectiveVehicleData?.enterpriseId || !effectiveVehicleData?.teamId)
      return;
    setThumbnailUploadError('');
    setIsUploadingThumbnail(true);
    try {
      const result = await uploadYoutubeThumbnail({
        imageFile: file,
        enterpriseId: effectiveVehicleData.enterpriseId,
        teamId: effectiveVehicleData.teamId,
        channelName:
          (formData.selectedChannel as any)?.name || 'youtube-channel',
      });
      const uploadedUrl = result?.data?.url ?? result?.url;
      if (!uploadedUrl) throw new Error('Missing uploaded thumbnail url');
      setCustomThumbnailUrl(uploadedUrl);
      setSelectedThumbnail(THUMBNAIL_SELECTION.UPLOADED);
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      setThumbnailUploadError('Thumbnail upload failed. Please try again.');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleClearCustomThumbnail = () => {
    setCustomThumbnailUrl('');
    setThumbnailUploadError('');
    setSelectedThumbnail(
      channelCustomThumbnail?.assetUrl
        ? THUMBNAIL_SELECTION.CHANNEL_CUSTOM
        : THUMBNAIL_SELECTION.HERO_ANGLE
    );
  };

  const handleGenerateThreeSixtyVideo = async () => {
    if (isGeneratingThreeSixty) return;
    if (
      !effectiveVehicleData?.mediaId ||
      !effectiveVehicleData?.enterpriseId ||
      !effectiveVehicleData?.teamId
    ) {
      return;
    }

    setThreeSixtyUrl('');
    setIsGeneratingThreeSixty(true);

    const userId = effectiveVehicleData?.userId || getCurrentUserId();

    try {
      const initResp = await requestThreeSixtyDownload({
        mediaId: effectiveVehicleData.mediaId,
        enterpriseId: effectiveVehicleData.enterpriseId,
        teamId: effectiveVehicleData.teamId,
        userId,
      });
      const requestId = initResp?.requestId;
      if (!requestId)
        throw new Error('Missing requestId from 360 download API');

      let pollCount = 0;
      const maxPollCount = 50;
      while (pollCount < maxPollCount) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const statusResp = await getThreeSixtyDownloadStatus({
          mediaId: effectiveVehicleData.mediaId,
          requestId,
        });
        const productData = statusResp?.products?.SPIN;
        const statusToken = String(productData?.status || '').toUpperCase();
        const url = productData?.url;

        if (statusToken === 'COMPLETED' && url) {
          setThreeSixtyUrl(url);
          showToast?.('Downloaded', 'success');
          return;
        }

        if (
          ['FAILED', 'ERROR', 'CANCELLED', 'REJECTED'].includes(statusToken)
        ) {
          throw new Error('360 generation failed');
        }
        pollCount += 1;
      }
      throw new Error('360 generation timed out');
    } catch (error) {
      console.error('Failed to generate 360 video:', error);
      showToast?.('Failed to generate 360 video', 'error');
    } finally {
      setIsGeneratingThreeSixty(false);
    }
  };

  const featureVideoEnabled =
    effectiveVehicleData?.outputProcessingList?.featureVideo === true;
  const featureVideoSkuId =
    effectiveVehicleData?.mediaChildRelations?.featureVideo?.id;
  const getDerivedVideoUrl = (format: 'video' | 'shorts') =>
    featureVideoEnabled && featureVideoSkuId
      ? getVideoUrlForFormat(skuVideos, format)
      : undefined;
  const selectedMediaItems = getSelectedMediaItems(
    formData.selectedChannel,
    formData.publishTypes
  );
  const videoUrlMissing =
    !isFetchingVideoUrl &&
    (selectedMediaItems.length === 0 ||
      selectedMediaItems.some((item) => {
        const formatsForItem = getFormatsForMediaItem(
          item,
          formData.publishTypes,
          formData.selectedFormats
        );
        return formatsForItem.some((fmt) => {
          const cf = findContentFormatForItem(item, fmt);
          const mediaType = mediaNameToType(item.name);
          const resolvedUrl =
            mediaType === '360_spin'
              ? threeSixtyUrl
              : cf?.url || getDerivedVideoUrl(fmt) || fallbackFeatureVideoUrl;
          return !resolvedUrl;
        });
      }));

  const isScheduleMode = formData.scheduledDate !== undefined;
  const scheduleInPast =
    isScheduleMode && isPastScheduleDate(formData.scheduledDate as Date);

  const handlePublishNow = () => {
    setScheduleError('');
    updateFormData({ scheduledDate: undefined });
  };

  const handleScheduleMode = () => {
    setScheduleError('');
    updateFormData({ scheduledDate: getDefaultScheduleDate() });
  };

  const handleScheduleDateChange = (date: Date | undefined) => {
    if (!date) {
      setScheduleError('');
      updateFormData({ scheduledDate: undefined });
      return;
    }
    if (isPastScheduleDate(date)) {
      setScheduleError('Schedule time must be in the future');
      return;
    }
    setScheduleError('');
    updateFormData({ scheduledDate: date });
  };

  const handleSubmit = async () => {
    if (isSubmitting || videoUrlMissing || scheduleInPast) return;
    if (!formData.selectedChannel?.id || !effectiveVehicleData?.dealerVinId)
      return;

    if (isScheduleMode && isPastScheduleDate(formData.scheduledDate as Date)) {
      setScheduleError('Schedule time must be in the future');
      showToast?.('Schedule time must be in the future', 'error');
      return;
    }

    const isScheduled = isScheduleMode;

    const publishData = selectedMediaItems.flatMap((item) =>
      getFormatsForMediaItem(
        item,
        formData.publishTypes,
        formData.selectedFormats
      )
        .map((fmt) => {
          const cf = findContentFormatForItem(item, fmt);
          const mediaType = mediaNameToType(item.name);
          const thumbnailSelection = normalizeThumbnailSelection(
            selectedThumbnail,
            !!customThumbnailUrl
          );
          const resolvedThumbnail =
            thumbnailSelection === THUMBNAIL_SELECTION.UPLOADED &&
            customThumbnailUrl
              ? { type: 'custom', assetUrl: customThumbnailUrl }
              : thumbnailSelection === THUMBNAIL_SELECTION.CHANNEL_CUSTOM &&
                  channelCustomThumbnail?.assetUrl
                ? {
                    type: 'custom',
                    assetUrl: channelCustomThumbnail.assetUrl,
                  }
                : { type: THUMBNAIL_SELECTION.HERO_ANGLE, assetUrl: '' };
          const resolvedUrl =
            mediaType === '360_spin'
              ? threeSixtyUrl
              : cf?.url || getDerivedVideoUrl(fmt) || fallbackFeatureVideoUrl;
          if (!resolvedUrl) return null;

          return {
            channelId: String(formData.selectedChannel?.id),
            dealerVinId: String(effectiveVehicleData?.dealerVinId),
            contentFormat: (fmt === 'shorts' ? 'short' : 'video') as
              | 'video'
              | 'short',
            media: mediaTypeToPayloadName(mediaType || undefined) as
              | 'video'
              | 'threesixty',
            tile: formData.title || '',
            description: formData.description || '',
            url: resolvedUrl,
            thumbnail: resolvedThumbnail,
            schedule: {
              publishAt: isScheduled
                ? formData.scheduledDate?.toISOString()
                : new Date().toISOString(),
              isScheduled,
            },
          };
        })
        .filter(Boolean)
    );
    if (publishData.length === 0) return;

    const payload = {
      enterpriseId: effectiveVehicleData?.enterpriseId,
      teamId: effectiveVehicleData?.teamId,
      platform: 'youtube',
      publishData,
    };
    setIsSubmitting(true);
    try {
      const result = await publishToSocialMedia(payload);
      const summary = result?.data ?? result ?? {};
      const publishedCount = summary?.published?.count ?? 0;
      const scheduledCount = summary?.scheduled?.count ?? 0;
      const skippedCount = summary?.skippedDuplicates?.count ?? 0;

      setSubmitFailed(false);
      handleClose();

      if (publishedCount === 0 && scheduledCount === 0 && skippedCount > 0) {
        showToast?.('Skipped — already published', 'info');
      } else {
        showToast?.(isScheduled ? 'Scheduled' : 'Queued', 'success');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      setSubmitFailed(true);
      showToast?.('Failed', 'error');
      setTimeout(() => setSubmitFailed(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setFormData(INITIAL_FORM);
    setAvailableChannels([]);
    setAvailablePublishTypes(DEFAULT_PUBLISH_TYPES);
    setAvailableFormats(YOUTUBE_FORMATS);
    setDisabledFormats([]);
    setChannelCustomThumbnail(null);
    setSelectedThumbnail(THUMBNAIL_SELECTION.HERO_ANGLE);
    setSkuVideos([]);
    setIsFetchingVideoUrl(false);
    setIsGeneratingThreeSixty(false);
    setThreeSixtyUrl('');
    setIsUploadingThumbnail(false);
    setCustomThumbnailUrl('');
    setThumbnailUploadError('');
    setScheduleError('');
    setIsLoadingConfig(true);
  };

  const handleBack = () => {
    resetState();
    onClose();
  };

  const handleClose = () => {
    resetState();
    onClose();
    if (onCloseAll) onCloseAll();
  };

  const heroAnglePreviewUrl = getHeroAnglePreviewUrl(effectiveVehicleData);

  return {
    formData,
    updateFormData,
    heroAnglePreviewUrl,
    isGenerating,
    isSubmitting,
    submitFailed,
    scheduleError,
    scheduleInPast,
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
    handleSubmit,
    handleBack,
    handleClose,
  };
};
