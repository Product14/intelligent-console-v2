import { createAction } from '@reduxjs/toolkit';

import {
  ActivitiesPaginationMeta,
  Activity,
  FetchActivitiesParams,
} from '../models/activities.model';

export interface ActivitiesPayload {
  activities?: Activity[];
  loading?: boolean;
  loaded?: boolean;
  error?: boolean;
  pagination?: ActivitiesPaginationMeta | null;
}

export interface SetSelectedActivityPayload {
  activity: Activity | null;
}

export enum ActivitiesActionTypes {
  FETCH_ACTIVITIES = 'activities/fetchActivities',
  FETCH_MORE_ACTIVITIES = 'activities/fetchMoreActivities',
  PATCH_ACTIVITIES = 'activities/patchActivities',
  SET_SELECTED_ACTIVITY = 'activities/setSelectedActivity',
}

export const fetchActivities = createAction<FetchActivitiesParams>(
  ActivitiesActionTypes.FETCH_ACTIVITIES
);

export const fetchMoreActivities = createAction<FetchActivitiesParams>(
  ActivitiesActionTypes.FETCH_MORE_ACTIVITIES
);

export const patchActivities = createAction<ActivitiesPayload>(
  ActivitiesActionTypes.PATCH_ACTIVITIES
);

export const setSelectedActivity = createAction<SetSelectedActivityPayload>(
  ActivitiesActionTypes.SET_SELECTED_ACTIVITY
);
