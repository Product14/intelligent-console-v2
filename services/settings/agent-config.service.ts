// Agent-config — unified GET/POST for the dealership's per-team agent
// configuration. The endpoint bundles ignoreAniNumbers, sales policies,
// sales reach-out & follow-ups, and service policies under a single
// `entityConfig` envelope. We only touch the `sales.reachOutAndFollowups`
// subtree from this codebase today — every other root is opaque.
//
//   GET  /central-config/v1/vini-config/agent-config?enterpriseId=…&teamId=…
//     → { enterpriseId, teamId, enterpriseName?, teamName?, entityConfig }
//
//   POST /central-config/v1/vini-config/agent-config
//     → partial body. Backend deep-merges. Other roots under entityConfig
//       are preserved when omitted.

import CentralAPI from '@/lib/settings/api/http';
import { getApiBaseUrl } from '@/lib/settings/runtime-config';
import type { SalesPolicies } from '@/types/settings/sales-policies';

// ---- Inner block types (reach-out & follow-ups subtree) --------------------

export type StlChannel = 'sms' | 'call';

export interface StlBlock {
  enabled: boolean;
  channel: StlChannel;
}

export interface SilenceNudgeBlock {
  enabled: boolean;
  channel: StlChannel;
  delayMinutes: number;
}

export interface SpeedToLeadSourceEntry {
  externalType: string;
  typeEnabled: boolean;
  /** Back-compat read-only. The adapter ignores this field — selection is
   *  driven entirely by `typeEnabled`. */
  sources?: unknown;
}

export interface SpeedToLeadSourceSavePayloadEntry {
  externalType: string;
  typeEnabled: boolean;
}

export interface FollowUpCadenceStep {
  /** Days after Day 1 (the instant-reachout day). */
  dayOffset: number;
  /** 24-hour HH:mm string. */
  scheduledTime: string;
  channel: StlChannel;
}

export interface FollowUpBlock {
  enabled: boolean;
  cadence: FollowUpCadenceStep[];
}

/** The reach-out subtree as it lives inside the agent-config payload. Every
 *  block is optional — the backend only includes blocks that have been
 *  saved at least once for this tenancy. */
export interface ReachOutAndFollowupsBlock {
  stl?: StlBlock;
  silenceNudge?: SilenceNudgeBlock;
  speedToLeadSources?: SpeedToLeadSourceEntry[];
  followUp?: FollowUpBlock;
}

/** Partial reach-out subtree for the POST body. `speedToLeadSources` here
 *  uses the strict save shape (no inner sources map). */
export interface ReachOutAndFollowupsSavePayloadBlock {
  stl?: StlBlock;
  silenceNudge?: SilenceNudgeBlock;
  speedToLeadSources?: SpeedToLeadSourceSavePayloadEntry[];
  followUp?: FollowUpBlock;
}

// ---- entityConfig envelope -------------------------------------------------

export interface AgentConfigEntity {
  ignoreAniNumbers?: string[];
  sales?: {
    policies?: SalesPolicies;
    reachOutAndFollowups?: ReachOutAndFollowupsBlock;
  };
  service?: {
    policies?: unknown;
  };
}

export interface AgentConfigResponse {
  enterpriseId?: string;
  teamId?: string;
  enterpriseName?: string;
  teamName?: string;
  entityConfig?: AgentConfigEntity;
}

export interface AgentConfigSavePayload {
  enterpriseId: string;
  teamId: string;
  entityConfig: {
    ignoreAniNumbers?: string[];
    sales?: {
      policies?: SalesPolicies;
      reachOutAndFollowups?: ReachOutAndFollowupsSavePayloadBlock;
    };
  };
}

export interface AgentConfigSaveResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

// ---- HTTP layer ------------------------------------------------------------

const AGENT_CONFIG_PATH = '/central-config/v1/vini-config/agent-config';

export const fetchAgentConfigAPI = async ({
  enterpriseId,
  teamId,
}: {
  enterpriseId: string;
  teamId: string;
}): Promise<AgentConfigResponse> => {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${AGENT_CONFIG_PATH}`;
  const response = await CentralAPI.handleGetRequest<
    AgentConfigResponse & { data?: AgentConfigResponse }
  >(url, { enterpriseId, teamId }, {}, { forceLive: true });
  // Some endpoints in this codebase wrap the body in `{ data: ... }`; others
  // don't. Accept either so a contract tweak doesn't break us.
  const body =
    response && typeof response === 'object' && 'data' in response && response.data
      ? response.data
      : response;
  if (!body || typeof body !== 'object') return {};
  // Backend returns `entityconfig` (lowercase) on GET while accepting
  // `entityConfig` (camelCase) on POST. Normalize so adapters can rely on
  // the camelCase form.
  const mut = body as Record<string, unknown>;
  if (!mut.entityConfig && mut.entityconfig) {
    mut.entityConfig = mut.entityconfig;
  }
  return body;
};

export const saveAgentConfigAPI = async (
  payload: AgentConfigSavePayload
): Promise<AgentConfigSaveResponse> => {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${AGENT_CONFIG_PATH}`;
  const response = await CentralAPI.handlePostRequest<AgentConfigSaveResponse>(
    url,
    payload,
    {},
    { forceLive: true }
  );
  return response || {};
};
