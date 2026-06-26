import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { OnboardingProgressData } from '../models/onboarding-progress.model';

export interface OnboardingProgressStoreInterface {
  data: OnboardingProgressData | null;
  loading: boolean;
  loaded: boolean;
}

const initialState: OnboardingProgressStoreInterface = {
  data: null,
  loading: false,
  loaded: false,
};

const onboardingProgressSlice = createSlice({
  name: 'onboardingProgress',
  initialState,
  reducers: {
    fetchOnboardingProgress(
      state,
      action: PayloadAction<{
        teamId: string;
        productLineId: string;
        forceRefresh?: boolean;
      }>
    ) {
      // This action is handled by saga, no state change needed here
    },
    setOnboardingProgress(
      state,
      action: PayloadAction<{ data: OnboardingProgressData }>
    ) {
      state.data = action.payload.data;
      state.loading = false;
      state.loaded = true;
    },
    setOnboardingProgressLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearOnboardingProgress(state) {
      state.data = null;
      state.loading = false;
      state.loaded = false;
    },
  },
});

export const {
  fetchOnboardingProgress,
  setOnboardingProgress,
  setOnboardingProgressLoading,
  clearOnboardingProgress,
} = onboardingProgressSlice.actions;

export default onboardingProgressSlice.reducer;
