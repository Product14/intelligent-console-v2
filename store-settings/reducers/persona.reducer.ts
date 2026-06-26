import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { PaginationMetadata, Persona } from '../models/persona.model';

export interface PersonaState {
  personas: Persona[];
  personasLoading: boolean;
  personasLoaded: boolean;
  paginationMetadata: PaginationMetadata | null;
}

const initialState: PersonaState = {
  personas: [],
  personasLoading: false,
  personasLoaded: false,
  paginationMetadata: null,
};

const personaSlice = createSlice({
  name: 'persona',
  initialState,
  reducers: {
    setPersonas(
      state,
      action: PayloadAction<{
        personas: Persona[];
        paginationMetadata?: PaginationMetadata;
      }>
    ) {
      state.personas = action.payload.personas;
      if (action.payload.paginationMetadata) {
        state.paginationMetadata = action.payload.paginationMetadata;
      }
      state.personasLoading = false;
      state.personasLoaded = true;
    },
    setPersonasLoading(state, action: PayloadAction<boolean>) {
      state.personasLoading = action.payload;
    },
    clearPersonas(state) {
      state.personas = [];
      state.personasLoading = false;
      state.personasLoaded = false;
      state.paginationMetadata = null;
    },
  },
});

export const { setPersonas, setPersonasLoading, clearPersonas } =
  personaSlice.actions;

export default personaSlice.reducer;
