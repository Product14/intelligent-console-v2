import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AgentType } from '../models/agent-types.model';

export interface AgentTypesStoreInterface {
  agentTypes: AgentType[];
  loading: boolean;
  loaded: boolean;
  contractLink: string;
}

const initialState: AgentTypesStoreInterface = {
  agentTypes: [],
  loading: false,
  loaded: false,
  contractLink: '',
};

const agentTypesSlice = createSlice({
  name: 'agentTypes',
  initialState,
  reducers: {
    setAgentTypes(
      state,
      action: PayloadAction<{
        agentTypes: AgentType[];
        contractLink?: string;
      }>
    ) {
      state.agentTypes = action.payload.agentTypes;
      state.contractLink = action.payload.contractLink || '';
      state.loading = false;
      state.loaded = true;
    },
    setAgentTypesLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearAgentTypes(state) {
      state.agentTypes = [];
      state.loading = false;
      state.loaded = false;
      state.contractLink = '';
    },
  },
});

export const { setAgentTypes, setAgentTypesLoading, clearAgentTypes } =
  agentTypesSlice.actions;

export default agentTypesSlice.reducer;
