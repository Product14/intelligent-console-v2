import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export type SpeedToLeadMode = 'FULLDAY' | 'WORKING_HOURS' | 'SILENT_HOURS';

/** Empty string = not selected (placeholder only); used when not from API */
export type SpeedToLeadModeOrEmpty = SpeedToLeadMode | '';

export function isSpeedToLeadMode(mode: string): mode is SpeedToLeadMode {
  return (
    mode === 'FULLDAY' || mode === 'WORKING_HOURS' || mode === 'SILENT_HOURS'
  );
}

export interface SpeedToLeadSourceConfig {
  isEnabled: boolean;
  mode: SpeedToLeadModeOrEmpty;
}

export interface SpeedToLeadBySource {
  [source: string]: SpeedToLeadSourceConfig;
}

export interface SpeedToLeadByLeadType {
  [leadType: string]: SpeedToLeadSourceConfig;
}

export interface SpeedToLeadDataPayload {
  enterpriseId: string;
  teamId: string;
  agentId: string;
  isSpeedToLeadEnabled: boolean;
  // speedToLeadBySource?: SpeedToLeadBySource;
  speedToLeadByLeadType: SpeedToLeadByLeadType;
}

export interface SpeedToLeadDataResponse {
  message?: string;
  error?: boolean;
  code?: string;
  data?: unknown;
}

export interface GetSpeedToLeadDataParams {
  enterpriseId: string;
  teamId: string;
  agentType: string;
  agentCallType: string;
  agentId: string;
}

export interface SpeedToLeadDataApiData {
  enterpriseId: string;
  teamId: string;
  isSpeedToLeadEnabled: boolean;
  speedToLeadBySource: SpeedToLeadBySource;
  speedToLeadByLeadType: SpeedToLeadByLeadType;
}

export interface GetSpeedToLeadDataApiResponse {
  success: boolean;
  message?: string;
  data?: SpeedToLeadDataApiData;
}

export interface GetSpeedToLeadDataResponse {
  speedToLeadBySource?: SpeedToLeadBySource;
  speedToLeadByLeadType?: SpeedToLeadByLeadType;
  [key: string]: unknown;
}

export interface LeadFilterOptionItem {
  external_type: string;
  source: string[];
}

const SPEED_TO_LEAD_DATA_URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/speed-to-lead-data`;
const SPEED_TO_LEAD_DATA_GET_URL = `${process.env.APP_BACKEND_BASEURL}/central-config/v1/vini-config`;
const LEAD_FILTER_OPTIONS_URL = `${process.env.APP_BACKEND_BASEURL}/conversation/campaign/lead-filter-options`;

export const getSpeedToLeadDataAPI = async (
  params: GetSpeedToLeadDataParams
): Promise<SpeedToLeadDataApiData | null> => {
  const response = await CentralAPIHandler.handleGetRequest(
    SPEED_TO_LEAD_DATA_GET_URL,
    {
      enterpriseId: params.enterpriseId,
      teamId: params.teamId,
      domain: 'product',
      entity: `${params.agentType}_${params.agentCallType}`.toLowerCase(),
      isCommonNeeded: true,
      agentId: params.agentId,
    }
  );
  return {
    enterpriseId: params.enterpriseId,
    teamId: params.teamId,
    isSpeedToLeadEnabled: response.agents?.isSpeedToLeadEnabled ?? true,
    speedToLeadBySource: response.agents?.speedToLeadBySource || null,
    speedToLeadByLeadType: response.agents?.speedToLeadByLeadType || null,
  };
};

export const getLeadFilterOptionsAPI = async (
  enterpriseId: string,
  teamId: string
): Promise<LeadFilterOptionItem[]> => {
  try {
    const response = await CentralAPIHandler.handleGetRequest(
      LEAD_FILTER_OPTIONS_URL,
      { enterpriseId, teamId }
    );
    return Array.isArray(response) ? response : [];
  } catch {
    return [];
  }
};

export const submitSpeedToLeadDataAPI = async (
  payload: SpeedToLeadDataPayload
): Promise<SpeedToLeadDataResponse> => {
  const response = await CentralAPIHandler.handlePostRequest(
    SPEED_TO_LEAD_DATA_URL,
    payload
  );
  return response;
};
