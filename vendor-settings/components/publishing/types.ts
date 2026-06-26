export interface PublishingData {
  vehicleId?: string;
  title?: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  enterpriseId?: string;
  teamId?: string;
  dealerVinId?: string;
  mediaId?: string;
  vin?: string;
  outputProcessingList?: Record<string, boolean | null>;
  mediaChildRelations?: Record<string, { id: string; label: string } | null>;
  [key: string]: any;
}

export interface PublishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: PublishingData;
  onDownloadClick?: () => void;
}

export interface PublishingProps {
  data?: PublishingData;
  trigger?: (props: { onClick: () => void }) => React.ReactNode;
  buttonClassName?: string;
  buttonText?: string;
  onDownloadClick?: () => void;
  showToast?: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
}

export interface ButtonConfig {
  id: string;
  label: string;
  iconName: string;
  iconSize: { collapsed: number; expanded: number };
  onClick: () => void;
  disabled?: boolean;
  variant?: 'download' | 'social' | 'more';
}
