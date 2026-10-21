import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  // Track hidden calendars rather than selected ones, so every calendar
  // (including newly created ones) is visible by default.
  hiddenCalendarIds: number[];
}

const initialState: UiState = {
  hiddenCalendarIds: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCalendarSelected(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.hiddenCalendarIds = state.hiddenCalendarIds.includes(id)
        ? state.hiddenCalendarIds.filter((existingId) => existingId !== id)
        : [...state.hiddenCalendarIds, id];
    },
  },
});

export const { toggleCalendarSelected } = uiSlice.actions;
export default uiSlice.reducer;
