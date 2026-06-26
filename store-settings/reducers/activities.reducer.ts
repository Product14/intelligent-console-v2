import { createReducer } from '@reduxjs/toolkit';

import {
  ActivitiesActionTypes,
  ActivitiesPayload,
  SetSelectedActivityPayload,
  patchActivities,
  setSelectedActivity,
} from '../actions/activities.actions';
import { ActivitiesStoreInterface } from '../models/activities.model';

const initialState: ActivitiesStoreInterface = {
  activities: [],
  activitiesLoading: false,
  activitiesLoaded: false,
  activitiesError: false,
  pagination: null,
  selectedActivity: null,
};

const activitiesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(patchActivities, (state, action) => {
      const payload: ActivitiesPayload = action.payload;
      if (payload.activities !== undefined) {
        // Append if paginating else replace
        const append =
          payload.pagination && state.pagination
            ? (payload.pagination.page ?? 1) > (state.pagination.page ?? 1)
            : false;
        state.activities = append
          ? [...state.activities, ...payload.activities]
          : payload.activities;
      }
      if (payload.loading !== undefined)
        state.activitiesLoading = payload.loading;
      if (payload.loaded !== undefined) state.activitiesLoaded = payload.loaded;
      if (payload.error !== undefined) state.activitiesError = payload.error;
      if (payload.pagination !== undefined)
        state.pagination = payload.pagination;
    })
    .addCase(setSelectedActivity, (state, action) => {
      const payload: SetSelectedActivityPayload = action.payload;
      state.selectedActivity = payload.activity;
    });
});

export default activitiesReducer;
