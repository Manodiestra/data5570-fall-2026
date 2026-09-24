import { configureStore } from '@reduxjs/toolkit';

import { calendarApi } from './api';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    [calendarApi.reducerPath]: calendarApi.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(calendarApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
