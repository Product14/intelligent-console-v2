import { VoiceConfigPayload } from './assistant/agent-configs';

export interface Language {
  languageId: string;
  languageName: string;
  languageCode: string;
  countryCode: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Voice {
  voiceId: string;
  voiceTypeId: string;
  provider: string;
  voiceName: string;
  languageId: string;
  aiModel: string | null;
  voiceConfig: VoiceConfigPayload;
  gender?: string;
  age?: number;
  nature?: string;
  countryCode?: string;
  accent?: string;
  voiceSampleRecording?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface VoiceOptionUI {
  id: string;
  name: string;
  age: number;
  gender: string;
  genderSymbol: string;
  flag: string;
  accent: string;
  personality: string[];
  avatarColor: string;
  avatar: string;
  duration: string;
  provider: string;
  voiceTypeId: string;
  languageId: string;
  voiceConfigs: VoiceConfigPayload;
  voiceSampleRecording?: string; // Add this for the voice sample recording URL
}
