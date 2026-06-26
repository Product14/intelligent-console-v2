import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface AnalyticsState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setConversationAnalyticsDashboard(state, action: PayloadAction<any>) {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
      console.log('action.payload', action.payload);
    },
    setConversationAnalyticsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setConversationAnalyticsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setConversationAnalyticsDashboard,
  setConversationAnalyticsLoading,
  setConversationAnalyticsError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
