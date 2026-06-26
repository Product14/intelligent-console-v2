import { createAction } from '@reduxjs/toolkit';

import { FetchPersonasParams } from '../models/persona.model';

// Personas Actions
export const fetchPersonas = createAction(
  'persona/fetchPersonas',
  (params?: FetchPersonasParams) => ({ payload: params || {} })
);
