import { Agent } from '@/app-models-settings/assistant/agent';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AgentsStoreInterface, OnboardedAgent } from '../models/agents.model';

const initialState: AgentsStoreInterface = {
  availableAgents: [],
  availableAgentsLoading: false,
  availableAgentsLoaded: false,
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAvailableAgents(
      state,
      action: PayloadAction<{ agents: OnboardedAgent[] }>
    ) {
      state.availableAgents = action.payload.agents ?? [];
      state.availableAgentsLoading = false;
      state.availableAgentsLoaded = true;
    },
    setAvailableAgentsLoading(state, action: PayloadAction<boolean>) {
      state.availableAgentsLoading = action.payload;
    },
    addAgent(state, action: PayloadAction<Agent>) {
      // state.availableAgents.push(action.payload);
    },
    updateAgent(state, action: PayloadAction<Agent>) {
      // const index = state.availableAgents.findIndex(
      //   (agent) => agent.id === action.payload.id
      // );
      // if (index !== -1) {
      //   state.availableAgents[index] = action.payload;
      // }
    },
    clearAvailableAgents(state) {
      state.availableAgents = [];
      state.availableAgentsLoading = false;
      state.availableAgentsLoaded = false;
    },
  },
});

export const {
  setAvailableAgents,
  setAvailableAgentsLoading,
  addAgent,
  updateAgent,
  clearAvailableAgents,
} = agentsSlice.actions;

export default agentsSlice.reducer;
