import { configureStore } from '@reduxjs/toolkit';

import calendarsReducer from './calendarsSlice';
import eventsReducer from './eventsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    calendars: calendarsReducer,
    events: eventsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
