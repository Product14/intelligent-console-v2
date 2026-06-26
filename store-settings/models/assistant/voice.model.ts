export interface VoiceConfig {
  stability: number;
  similarityBoost: number;
}

export interface Voice {
  voiceId: string;
  voiceTypeId: string;
  provider: string;
  voiceName: string;
  aiModel: string;
  voiceConfig: VoiceConfig;
  languageId: string;
}
