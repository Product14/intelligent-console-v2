// IMS Provider data configuration
export interface ImsPartner {
  id: string;
  name: string;
  icon: string;
  type?: 'ftp' | 'api' | 'manual';
}

export const IMS_PARTNERS: ImsPartner[] = [
  {
    id: 'vincue',
    name: 'VinCue',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/vincue.png',
    type: 'ftp',
  },
  {
    id: 'vauto',
    name: 'vAuto',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/vauto.png',
    type: 'ftp',
  },
  {
    id: 'inventory-cox',
    name: 'Inventory +Cox Automotive',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/cox-automotive.png',
    type: 'ftp',
  },
  {
    id: 'tekion',
    name: 'Tekion',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/tekion.png',
    type: 'ftp',
  },
  {
    id: 'homenet',
    name: 'Homenet',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/homenet.png',
    type: 'ftp',
  },
  {
    id: 'dealer-centre',
    name: 'Dealer Centre',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/dealer-centre.png',
    type: 'ftp',
  },
  {
    id: 'frazer-dms',
    name: 'Frazer DMS',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/frazer-dms.png',
    type: 'ftp',
  },
  {
    id: 'automanager',
    name: 'Automanager DeskManager',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/automanager.png',
    type: 'ftp',
  },
  {
    id: 'keyloop',
    name: 'Keyloop',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/keyloop.png',
    type: 'ftp',
  },
  {
    id: 'pinewood-dms',
    name: 'Pinewood DMS',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/pinewood-dms.png',
    type: 'ftp',
  },
  {
    id: 'reynolds',
    name: 'Reynolds and Reynolds',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/reynolds.png',
    type: 'ftp',
  },
  {
    id: 'cox-automotive-1',
    name: 'Cox Automotive',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/cox-automotive.png',
    type: 'ftp',
  },
  {
    id: 'cox-automotive-2',
    name: 'Cox Automotive',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/cox-automotive.png',
    type: 'ftp',
  },
  {
    id: 'cox-automotive-3',
    name: 'Cox Automotive',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/cox-automotive.png',
    type: 'ftp',
  },
  {
    id: 'cox-automotive-4',
    name: 'Cox Automotive',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/cox-automotive.png',
    type: 'ftp',
  },
  {
    id: 'cox-automotive-5',
    name: 'Cox Automotive',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/cox-automotive.png',
    type: 'ftp',
  },
  {
    id: 'cox-automotive-6',
    name: 'Cox Automotive',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ims-icons/cox-automotive.png',
    type: 'ftp',
  },
];

// Option types for alternative IMS selection methods
export type ImsOptionType = 'public-api' | 'no-ims' | 'ims-not-listed';

export interface ImsAlternativeOption {
  id: ImsOptionType;
  title: string;
  description: string;
  externalLink?: string;
}

export const IMS_ALTERNATIVE_OPTIONS: ImsAlternativeOption[] = [
  {
    id: 'public-api',
    title: 'Use Public API-',
    description: "Add vehicles to your Spyne's Inventory using public APIs",
    externalLink: 'https://docs.spyne.ai/docs/authentication',
  },
  {
    id: 'no-ims',
    title: "I don't have IMS-",
    description: 'I will create VINs directly on Spyne platforms',
  },
];
