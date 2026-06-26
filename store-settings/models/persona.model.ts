export interface FetchPersonasParams {
  enterpriseId?: string;
  teamId?: string;
  agentTypeId: string;
  languageId?: string | null;
  gender?: string;
  voiceId?: string;
  templateName?: string;
  templateId?: string;
  forceRefresh?: boolean;
  page?: number;
  limit?: number;
}

export interface Persona extends Template {}

export interface Template {
  templateId: string;
  imageUrl: string;
  name: string;
  countryCode: string;
  nationality: string;
  gender: string;
  supportedLanguages: SupportedLanguage[];
  description?: string;
  city?: string;
}

export interface SupportedLanguage {
  languageId: string;
  languageName: string;
  languageCode: string;
  countryCode: string;
  sampleAudioUrl: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetPersonasResponseDto {
  data: Persona[];
  paginationMetadata: PaginationMetadata;
}
