import { ButtonConfig } from './types';

export const createSocialButtonsConfig = (
  setYoutubeModalOpen: (open: boolean) => void,
  handleDisabledClick: (platform: string) => void,
  enabledPlatforms: string[] = []
): ButtonConfig[] => [
  {
    id: 'youtube',
    label: 'Youtube',
    iconName: 'youtube',
    iconSize: { collapsed: 32, expanded: 28 },
    onClick: () =>
      enabledPlatforms.includes('youtube')
        ? setYoutubeModalOpen(true)
        : handleDisabledClick('Youtube'),
    disabled: !enabledPlatforms.includes('youtube'),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    iconName: 'facebook',
    iconSize: { collapsed: 32, expanded: 28 },
    onClick: () => handleDisabledClick('Facebook'),
    disabled: !enabledPlatforms.includes('facebook'),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    iconName: 'instagram',
    iconSize: { collapsed: 32, expanded: 28 },
    onClick: () => handleDisabledClick('Instagram'),
    disabled: !enabledPlatforms.includes('instagram'),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    iconName: 'whatsapp',
    iconSize: { collapsed: 32, expanded: 28 },
    onClick: () => handleDisabledClick('WhatsApp'),
    disabled: !enabledPlatforms.includes('whatsapp'),
  },
];

export const createCollapsedButtonsConfig = (
  handleDownload: () => void,
  setShowAllSocial: (show: boolean) => void,
  socialButtons: ButtonConfig[]
): ButtonConfig[] => [
  {
    id: 'download',
    label: 'Download',
    iconName: 'DownloadVirtual',
    iconSize: { collapsed: 20, expanded: 20 },
    onClick: handleDownload,
    variant: 'download',
  },
  socialButtons[0], // YouTube
  socialButtons[1], // Facebook
  {
    id: 'see-all',
    label: 'See All',
    iconName: 'options',
    iconSize: { collapsed: 20, expanded: 20 },
    onClick: () => setShowAllSocial(true),
    variant: 'more',
  },
];
