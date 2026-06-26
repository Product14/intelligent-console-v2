import { createAction } from '@reduxjs/toolkit';

import { AgentType } from '../models/agent-types.model';

export const fetchAgentTypes = createAction(
  'agentTypes/fetchAgentTypes',
  (payload: {
    enterpriseId: string;
    teamId: string;
    forceRefresh?: boolean;
  }) => ({ payload })
);

export const setAgentTypes = createAction(
  'agentTypes/setAgentTypes',
  (payload: { agentTypes: AgentType[]; contractLink?: string }) => ({ payload })
);

export const setAgentTypesLoading = createAction(
  'agentTypes/setAgentTypesLoading',
  (payload: boolean) => ({ payload })
);

export const clearAgentTypes = createAction('agentTypes/clearAgentTypes');
