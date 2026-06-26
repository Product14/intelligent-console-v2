'use client';

// Shim for use-agent-types-redux — returns a single agent type derived from the
// bridge (the agent currently being onboarded), instead of a Redux-cached list.
import { getConsoleContext } from '@/lib/settings/bridge/context-store';

export interface AgentType {
  agentTypeId: string;
  agentType: string;
  agentCallType: string;
}

export const useAgentTypesRedux = (_params?: unknown) => {
  const ctx = getConsoleContext();
  const agentType = ctx?.agentType ?? 'sales';
  const agentCallType = ctx?.agentCallType ?? 'inbound';
  const agentTypeId = `${agentCallType}${agentType.charAt(0).toUpperCase()}${agentType.slice(1)}`;
  const agentTypes: AgentType[] = [{ agentTypeId, agentType, agentCallType }];
  return {
    agentTypes,
    contractLink: '',
    isLoading: false,
    loading: false,
    loaded: true,
    refetch: () => {},
    clearCache: () => {},
  };
};
