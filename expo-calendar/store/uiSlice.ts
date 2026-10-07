import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  selectedCalendarIds: number[];
  initialized: boolean;
}

const initialState: UiState = {
  selectedCalendarIds: [],
  initialized: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Called once the calendar list first loads, to select everything by default.
    initializeSelectedCalendars(state, action: PayloadAction<number[]>) {
      state.selectedCalendarIds = action.payload;
      state.initialized = true;
    },
    toggleCalendarSelected(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.selectedCalendarIds = state.selectedCalendarIds.includes(id)
        ? state.selectedCalendarIds.filter((existingId) => existingId !== id)
        : [...state.selectedCalendarIds, id];
    },
  },
});

export const { initializeSelectedCalendars, toggleCalendarSelected } = uiSlice.actions;
export default uiSlice.reducer;
