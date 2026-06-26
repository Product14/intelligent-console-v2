'use client';

// Minimal RTK store. The onboarding screens only select `enterpriseTeamReducer`,
// `authReducer` and `onboardingProgress`, so we compose just those — avoiding the
// full root-reducer (whose campaign/appointment/etc. slices pull broad app deps).
// No saga middleware; dispatched thunks are harmless no-ops (no backend here).

import { combineReducers, configureStore, createReducer } from '@reduxjs/toolkit';
import onboardingProgressReducer from './reducers/onboarding-progress.reducer';
import { getConsoleContext } from '@/lib/settings/bridge/context-store';

const ctx = typeof window !== 'undefined' ? getConsoleContext() : null;

const enterpriseTeamReducer = createReducer(
  {
    enterpriseId: ctx?.enterpriseId,
    teamId: ctx?.teamId,
    teamName: ctx?.teamId,
    selectedTeam: ctx?.teamId ? { team_id: ctx.teamId, team_name: ctx.teamId } : undefined,
    teamsList: ctx?.teamId ? [{ team_id: ctx.teamId }] : [],
  },
  () => {}
);

const authReducer = createReducer(
  { userId: ctx?.authKey, authKey: ctx?.authKey, isLoggedIn: !!ctx?.authKey },
  () => {}
);

const rootReducer = combineReducers({
  onboardingProgress: onboardingProgressReducer,
  enterpriseTeamReducer,
  authReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false, immutableCheck: false }),
});

export type AppRootState = ReturnType<typeof store.getState>;
