import type { AgentType, AgentVariant } from '@/lib/settings/onboarding-model';
import { segmentName } from '@/lib/settings/onboarding-model';

export interface AgentSlot {
  variant: AgentVariant;
  label: string;
  segment: string;
}

export function getAgentSlots(agentType: AgentType): AgentSlot[] {
  const cap = agentType.charAt(0).toUpperCase() + agentType.slice(1);
  const inbound: AgentSlot = {
    variant: 'inbound',
    label: `Inbound ${cap}`,
    segment: segmentName('inbound', agentType),
  };
  // Reception is inbound-only — receptionist agents don't make outbound calls.
  if (agentType === 'reception') return [inbound];
  return [
    inbound,
    { variant: 'outbound', label: `Outbound ${cap}`, segment: segmentName('outbound', agentType) },
  ];
}
