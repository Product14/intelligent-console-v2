// Adapter between the agent-config wire envelope and the form's SalesPolicies.
//
// The form's SalesPolicies type matches `entityConfig.sales.policies` 1:1
// (same field and enum names), so this file is pure envelope handling —
// extract on read, wrap on write. Backend treats omitted top-level blocks as
// "preserve existing" so we only send the sales.policies slice we own.

import type {
  AgentConfigResponse,
  AgentConfigSavePayload,
} from '@/services/settings/agent-config.service';
import type { SalesPolicies } from '@/types/settings/sales-policies';

export function extractSalesPoliciesFromAgentConfig(
  resp: AgentConfigResponse | null | undefined,
): SalesPolicies {
  return resp?.entityConfig?.sales?.policies ?? {};
}

/** Wrap the form's SalesPolicies in the agent-config envelope.
 *
 *  paymentEstimates: only `enabled` is form-owned. `provider` and
 *  `buyerLocationZip` are set by ops / sourced from rooftop profile and live
 *  in the backend's stored value — we strip them on save so the backend
 *  preserves whatever's already there. */
export function buildAgentConfigSalesPoliciesPayload(args: {
  enterpriseId: string;
  teamId: string;
  policies: SalesPolicies;
}): AgentConfigSavePayload {
  const policies: SalesPolicies = { ...args.policies };
  if (policies.paymentEstimates) {
    policies.paymentEstimates = { enabled: !!policies.paymentEstimates.enabled };
  }
  return {
    enterpriseId: args.enterpriseId,
    teamId: args.teamId,
    entityConfig: { sales: { policies } },
  };
}
