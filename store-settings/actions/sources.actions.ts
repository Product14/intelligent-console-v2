import { Source } from '@/models/sources.model';
import { createAction } from '@reduxjs/toolkit';

export const fetchSources = createAction(
  'sources/fetchSources',
  (payload: { enterprise_id: string; team_id: string }) => ({ payload })
);

export const setSources = createAction(
  'sources/setSources',
  (payload: { sources: Source[] }) => ({ payload })
);

export const setSourcesLoading = createAction(
  'sources/setSourcesLoading',
  (payload: boolean) => ({ payload })
);

export const setSourcesError = createAction(
  'sources/setSourcesError',
  (payload: string | null) => ({ payload })
);
