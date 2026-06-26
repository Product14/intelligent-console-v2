import { createAction } from '@reduxjs/toolkit';

import { FetchAgentsParams } from '../models/agents.model';

export const fetchAvailableAgents = createAction(
  'agents/fetchAvailableAgents',
  (params: FetchAgentsParams) => ({ payload: params })
);

export const setActiveAgentId = createAction(
  'agents/setActiveAgentId',
  (agentId: string | null) => ({ payload: agentId })
);

export const clearAvailableAgents = createAction('agents/clearAvailableAgents');
