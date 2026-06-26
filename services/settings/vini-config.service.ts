import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import CentralAPI from '@/lib/settings/api/http';
import { getApiBaseUrl } from '@/lib/settings/runtime-config';

import {
  FetchViniConfigPayload,
  RequestPayloadCreateConfig,
} from '../types/vini-config';
import type {
  ViniDepartmentsConfigResponse,
  ViniDepartmentsSavePayload,
} from '../types/vini-departments-api';

export interface CreateViniConfigResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ViniConfigResponse {
  [key: string]: any;
}

export const updateRooftopConfigAPI = async (
  payload: RequestPayloadCreateConfig
): Promise<CreateViniConfigResponse> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/update-rooftop-data`;

  const response = await CentralAPIHandler.handlePostRequest(url, payload);

  return response;
};

// ---------------------------------------------------------------------------
// Rooftop profile — fetch & partial update
// ---------------------------------------------------------------------------
//
// Console's onboarding rooftop screen fetches via
//   GET  {BASE}/user-management/v1/team/get-team-details?team_id=…
// and saves via
//   POST {BASE}/console/v1/product-onboarding/update-rooftop-data
// always sending the FULL rooftop blob (buildRooftopDetailsPayload).
//
// We send a *partial* body for timezone-only updates — i.e. just tenancy IDs
// plus `rooftopData.timeZone`. The product-onboarding endpoint may or may not
// tolerate omitted fields; if it 4xx's with "required field missing" the
// backend team needs to make it a true PATCH-style upsert.
// ---------------------------------------------------------------------------

export interface FetchRooftopProfileResponse {
  data?: {
    team?: {
      teamId?: string;
      teamName?: string;
      teamType?: string;
      teamSubType?: string;
      timeZone?: string;
      regionType?: string;
      websiteLink?: string;
      websiteListingUrl?: string;
      address?: unknown;
      geoCoordinates?: unknown;
      enterpriseId?: string;
    };
    user?: {
      userId?: string;
      userName?: string;
      emailId?: string;
      contactNo?: string;
      isdCode?: string;
    };
  };
}

/** GET the rooftop's profile (used to seed the form on load). */
export const fetchRooftopProfileAPI = async (
  teamId: string
): Promise<FetchRooftopProfileResponse> => {
  // Browser → backend direct. Backend MUST emit CORS headers (Access-Control-
  // Allow-Origin for this app's origin, plus authorization + content-type).
  // Base URL comes from /config.json at runtime — see lib/runtime-config.ts.
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}/user-management/v1/team/get-team-details`;
  return await CentralAPI.handleGetRequest<FetchRooftopProfileResponse>(
    url,
    { team_id: teamId },
    {},
    { forceLive: true }
  );
};

export interface UpdateRooftopTimezoneParams {
  enterpriseId: string;
  teamId: string;
  /** Required by the backend even on partial updates — we pass through the
   *  value loaded by getProfile, never user-edited content. */
  teamName: string;
  timezone: string;
}

/** Partial POST — only the timezone is sent under rooftopData. */
export const updateRooftopTimezoneAPI = async (
  params: UpdateRooftopTimezoneParams
): Promise<CreateViniConfigResponse> => {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}/console/v1/product-onboarding/update-rooftop-data`;
  // Minimal payload — every other rooftopData field is intentionally omitted.
  // Top-level identifiers (enterpriseId, teamId, teamName) are required by
  // the backend on every call; they identify *which* rooftop is being
  // updated, not what's being changed.
  const payload = {
    enterpriseId: params.enterpriseId,
    teamId: params.teamId,
    teamName: params.teamName,
    domain: 'rooftop',
    entity: 'INFO',
    rooftopData: {
      timeZone: params.timezone,
    },
  };
  return await CentralAPI.handlePostRequest<CreateViniConfigResponse>(
    url,
    payload,
    {},
    { forceLive: true }
  );
};

export const createViniConfigAPI = async (
  payload: RequestPayloadCreateConfig
): Promise<CreateViniConfigResponse> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/vini/create-config`;

  const requestPayload: any = {
    enterpriseId: payload.enterpriseId,
    teamId: payload.teamId,
    domain: 'product',
    entity: payload.entity,
    userId: payload.userId,
    entityConfig: payload.entityConfig,
    ...(!!payload.createPhoneNumber && { createPhoneNumber: true }),
  };

  const response = await CentralAPIHandler.handlePostRequest(
    url,
    requestPayload
  );

  return response;
};

export const deployAgentAPI = async (
  enterpriseId: string,
  teamId: string,
  userId: string,
  agentType: string,
  agentCallType: string,
  agentId: string
): Promise<CreateViniConfigResponse> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/vini/create-config`;

  const response = await CentralAPIHandler.handlePostRequest(url, {
    enterpriseId,
    teamId,
    domain: 'product',
    entity: `${agentType}_${agentCallType}`.toLowerCase(),
    userId,
    entityConfig: {
      agent: {
        agentId: agentId,
        isReadyToGoLive: true,
      },
    },
  });

  return response;
};

export const fetchViniConfigAPI = async ({
  enterpriseId,
  teamId,
  agentType,
  agentCallType,
  isCommonNeeded,
  agentId,
}: FetchViniConfigPayload): Promise<ViniConfigResponse> => {
  const entity = `${agentType}_${agentCallType}`.toLowerCase();
  const url = `${process.env.APP_BACKEND_BASEURL}/central-config/v1/vini-config/`;

  const queryParams = {
    enterpriseId,
    teamId,
    domain: 'product',
    entity,
    isCommonNeeded,
    agentId,
  };

  const response = await CentralAPIHandler.handleGetRequest(url, queryParams);

  return response || {};
};

export interface FetchDepartmentsConfigPayload {
  enterpriseId: string;
  teamId: string;
}

/**
 * Fetch the departments + holidays configuration for a (enterprise, team).
 * The response carries both lists in one envelope; callers typically pipe it
 * through `mapApiResponseToDepartments` / `mapApiResponseToHolidays` in
 * `@/lib/settings/adapters/departments-adapter` to get the form's DTOs.
 *
 * In mock mode (`NEXT_PUBLIC_API_MODE !== 'live'`) the http shim returns an
 * empty payload — callers should fall back to local defaults in that case.
 */
export const fetchDepartmentsConfigAPI = async ({
  enterpriseId,
  teamId,
}: FetchDepartmentsConfigPayload): Promise<ViniDepartmentsConfigResponse> => {
  // Browser → backend direct. Backend MUST emit CORS headers. `forceLive: true`
  // skips the global mock short-circuit (other unwired services keep mock fallback).
  // Base URL comes from /config.json at runtime — see lib/runtime-config.ts.
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}/central-config/v1/vini-config/departments`;
  const response = await CentralAPI.handleGetRequest<ViniDepartmentsConfigResponse>(
    url,
    { enterpriseId, teamId },
    {},
    { forceLive: true }
  );
  return response || ({} as ViniDepartmentsConfigResponse);
};

export interface SaveDepartmentsConfigResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

/** Upsert the full vini-config departments + holidays payload. */
export const saveDepartmentsConfigAPI = async (
  payload: ViniDepartmentsSavePayload
): Promise<SaveDepartmentsConfigResponse> => {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}/console/v1/product-onboarding/vini/departments`;
  const response = await CentralAPI.handlePostRequest<SaveDepartmentsConfigResponse>(
    url,
    payload,
    {},
    { forceLive: true }
  );
  return response || {};
};

/**
 * Scrape the dealership's public website and return a populated departments +
 * holidays envelope. The inner payload uses the same shape as the GET
 * `/central-config/v1/vini-config/departments` endpoint, so the regular read
 * adapters can map it straight into the form's DTOs — but unlike the GET, the
 * POST response wraps the payload in a standard `{ message, error, code,
 * details, data }` envelope. Unwrap here so callers stay adapter-shaped.
 */
export const autofillDepartmentsAPI = async (
  website: string
): Promise<ViniDepartmentsConfigResponse> => {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}/console/v1/product-onboarding/get-website-info?newFlow=true`;
  const response = await CentralAPI.handlePostRequest<{
    data?: ViniDepartmentsConfigResponse;
  } & ViniDepartmentsConfigResponse>(
    url,
    { website },
    {},
    { forceLive: true }
  );
  // Accept either the wrapped (current) or unwrapped (defensive) envelope.
  // If `data` is present and looks like the payload, use it; else fall back
  // to the response itself so a future contract change doesn't break us.
  if (response && typeof response === 'object' && 'data' in response && response.data) {
    return response.data;
  }
  return (response as ViniDepartmentsConfigResponse) || ({} as ViniDepartmentsConfigResponse);
};
