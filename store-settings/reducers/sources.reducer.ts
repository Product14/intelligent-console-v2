import { Source } from '@/models/sources.model';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface SourcesState {
  items: Source[];
  loading: boolean;
  error: string | null;
}

const initialState: SourcesState = {
  items: [],
  loading: false,
  error: null,
};

const sourcesSlice = createSlice({
  name: 'sources',
  initialState,
  reducers: {
    setSources(
      state,
      action: PayloadAction<{
        sources: Source[];
      }>
    ) {
      state.items = action.payload.sources;
      state.loading = false;
      state.error = null;
    },
    setSourcesLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setSourcesError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setSources, setSourcesLoading, setSourcesError } =
  sourcesSlice.actions;

export default sourcesSlice.reducer;
