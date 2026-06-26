import axios, { AxiosRequestConfig } from 'axios';
import { generateBearerToken } from './token';
import { emitToParent } from '@/lib/settings/bridge/context-store';

// Adapted from packages/utils/src/centralAPIHandler/*. Same call surface
// (handleGet/Post/Put/Patch/Delete) so cherry-picked services work unchanged,
// but the bearer token comes from the bridge context, and 401 notifies the parent.

export const APP_BACKEND_BASEURL =
  process.env.NEXT_PUBLIC_APP_BACKEND_BASEURL || '';

export class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function onUnauthorized() {
  emitToParent({
    type: 'onboarding:error',
    payload: { message: 'Session expired (401). Re-authentication required.' },
  });
}

const API_MODE = process.env.NEXT_PUBLIC_API_MODE;

/** Per-call options. `forceLive` opts a single call out of the global mock
 *  short-circuit — used by newly-migrated services that ARE wired to the
 *  backend, while the rest of the codebase still relies on mock fallbacks. */
export interface RequestOptions {
  forceLive?: boolean;
}

async function request<T>(
  config: AxiosRequestConfig,
  headers: Record<string, string> = {},
  options: RequestOptions = {}
): Promise<T> {
  // Mock mode: there is no backend, so DON'T make a real (failing) request.
  // Resolve a benign, success-shaped empty payload so vendored services/components
  // render their empty states instead of throwing → no error-toast pile-up.
  if (API_MODE !== 'live' && !options.forceLive) {
    // Services unwrap inconsistently: some read `response`, some `response.data`,
    // some call `response.map(...)`. Return an empty ARRAY that also carries
    // `.data`/`.error`/`.code` so every convention sees a benign empty result
    // (no throw → no "Failed to load …" toast).
    if (config.method === 'GET') {
      const arr = [] as unknown as Record<string, unknown> & unknown[];
      arr.data = [];
      arr.error = false;
      arr.code = 'SUCCESS';
      arr.message = '';
      return arr as unknown as T;
    }
    return { data: {}, error: false, code: 'SUCCESS', message: '' } as unknown as T;
  }

  const bearerToken = generateBearerToken(headers);
  try {
    const res = await axios({
      ...config,
      headers: { authorization: bearerToken, ...headers, ...(config.headers || {}) },
    });
    const data = res?.data;
    if (data && typeof data === 'object' && 'error' in data && (data as { error?: boolean }).error) {
      throw new ApiError(
        (data as { message?: string }).message || 'Unknown error occurred',
        res.status,
        data
      );
    }
    return data as T;
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };
    if (axiosErr?.response?.status === 401) onUnauthorized();
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      axiosErr?.message || 'Request failed',
      axiosErr?.response?.status,
      axiosErr?.response?.data
    );
  }
}

export function handleGetRequest<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  headers: Record<string, string> = {},
  options: RequestOptions = {}
): Promise<T> {
  return request<T>({ method: 'GET', url, params: params || {} }, headers, options);
}

export function handlePostRequest<T = unknown>(
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
  options: RequestOptions = {}
): Promise<T> {
  return request<T>({ method: 'POST', url, data: body }, headers, options);
}

export function handlePutRequest<T = unknown>(
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
  options: RequestOptions = {}
): Promise<T> {
  return request<T>({ method: 'PUT', url, data: body }, headers, options);
}

export function handlePatchRequest<T = unknown>(
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
  options: RequestOptions = {}
): Promise<T> {
  return request<T>({ method: 'PATCH', url, data: body }, headers, options);
}

export function handleDeleteRequest<T = unknown>(
  url: string,
  headers: Record<string, string> = {},
  options: RequestOptions = {}
): Promise<T> {
  return request<T>({ method: 'DELETE', url }, headers, options);
}

// Default-export shim matching @spyne-console/utils/centralAPIHandler so
// cherry-picked services can `import CentralAPIHandler from '@/lib/settings/api'`.
const CentralAPIHandler = {
  handleGetRequest,
  handlePostRequest,
  handlePutRequest,
  handlePatchRequest,
  handleDeleteRequest,
};

export default CentralAPIHandler;
