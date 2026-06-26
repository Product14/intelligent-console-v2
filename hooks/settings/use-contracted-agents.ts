'use client';

// Which agents the rooftop has contracted — drives which steps/agents render.
// Mock/now: derive from the bridge; in stub/dev default to a representative set
// (both sales + both service) so every section is exercisable.
// Live: replace with getContractedAgentsAPI (services/agents.service.ts).

import { getConsoleContext } from '@/lib/settings/bridge/context-store';
import { DEV_DEFAULT_CONTRACTED } from '@/lib/settings/onboarding-config';
import type { ContractedAgent } from '@/lib/settings/resolve-onboarding';

const FULL_SET: ContractedAgent[] = [
  { agentType: 'sales', agentCallType: 'inbound', agentTypeId: 'inboundSales' },
  { agentType: 'sales', agentCallType: 'outbound', agentTypeId: 'outboundSales' },
  { agentType: 'service', agentCallType: 'inbound', agentTypeId: 'inboundService' },
  { agentType: 'service', agentCallType: 'outbound', agentTypeId: 'outboundService' },
  { agentType: 'reception', agentCallType: 'inbound', agentTypeId: 'inboundReception' },
];

export function useContractedAgents(): { agents: ContractedAgent[]; isLoading: boolean } {
  const ctx = getConsoleContext();

  // If the parent passed an explicit contracted list via bridge, prefer it.
  const fromBridge = (ctx as unknown as { contractedAgents?: ContractedAgent[] })?.contractedAgents;
  if (fromBridge && fromBridge.length) {
    return { agents: fromBridge, isLoading: false };
  }

  if (DEV_DEFAULT_CONTRACTED) {
    return { agents: FULL_SET, isLoading: false };
  }

  // Fallback: the single agent the bridge is currently scoped to.
  if (ctx?.agentType && ctx?.agentCallType) {
    return {
      agents: [
        {
          agentType: ctx.agentType as ContractedAgent['agentType'],
          agentCallType: ctx.agentCallType as ContractedAgent['agentCallType'],
        },
      ],
      isLoading: false,
    };
  }
  return { agents: [], isLoading: false };
}
