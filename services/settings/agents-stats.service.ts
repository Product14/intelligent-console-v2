import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

// Types for Agent Stats and Sample Calls
export interface AgentStats {
  increase_in_leads: number;
  reduction_in_no_shows: number;
  customer_availability: string;
  savings: string;
}

export interface SampleCall {
  callId: string;
  reportTitle: string;
  isPresent: boolean;
  title: string;
}

export interface AgentStatsResponse {
  agentstats: AgentStats;
  sampleCalls: SampleCall[];
}

// Service to fetch agent stats and sample calls
export const fetchAgentStatsAPI = async (
  agentType: string,
  agentCallType: string
): Promise<AgentStatsResponse> => {
  // Construct query param from agentType_agentCallType to lowercase
  const agentTypeParam = `${agentType}_${agentCallType}`.toLowerCase();

  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/sample-agents?agent_type=${agentTypeParam}`;
  const response = await CentralAPIHandler.handleGetRequest(url);

  return response;
};
