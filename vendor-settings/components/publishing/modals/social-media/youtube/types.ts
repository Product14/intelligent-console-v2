export interface YoutubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseAll?: () => void;
  vehicleData?: any;
  showToast?: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
}

export interface ApiThumbnail {
  type: string;
  assetUrl: string;
}

export interface YoutubeChannel {
  id: string;
  name: string;
  avatar: string;
  media?: any[];
  title?: string;
  description?: string;
}

export interface YoutubePublishFormat {
  type: 'video' | 'shorts';
  label: string;
  imageUrl: string;
}

export interface YoutubePublishType {
  type: 'video_tour' | '360_spin';
  label: string;
  selected: boolean;
  iconName: string;
  disabled?: boolean;
}

export interface YoutubeFormData {
  // Step 1: Platform & Format
  selectedChannel: YoutubeChannel | null;
  publishTypes: YoutubePublishType[];
  selectedFormats: ('video' | 'shorts')[];

  // Step 2: Video Details
  title: string;
  description: string;
  tags: string[];
  thumbnail: string | null;

  // Step 3: Review & Publish
  scheduledDate?: Date;
  visibility: 'public' | 'private' | 'unlisted';
}

export const YOUTUBE_FORMATS: YoutubePublishFormat[] = [
  {
    type: 'video',
    label: 'Video',
    imageUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/console/billing/Post.svg',
  },
  {
    type: 'shorts',
    label: 'Shorts',
    imageUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/console/billing/Reels.svg',
  },
];

export const THUMBNAIL_SELECTION = {
  HERO_ANGLE: 'heroAngle',
  /** Custom thumbnail configured on the channel (social-config). */
  CHANNEL_CUSTOM: 'channelCustom',
  /** User-uploaded thumbnail for this publish session. */
  UPLOADED: 'uploaded',
} as const;

export const HERO_ANGLE_THUMBNAIL_PLACEHOLDER =
  'https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/youtube.svg';

export const DEFAULT_PUBLISH_TYPES: YoutubePublishType[] = [
  {
    type: 'video_tour',
    label: 'Video Tour',
    selected: true,
    iconName: 'videoCif',
  },
  { type: '360_spin', label: '360 Spin', selected: false, iconName: 'cif360' },
];
