import {
  createSlice,
  type PayloadAction,
  type ThunkAction,
  type UnknownAction,
} from '@reduxjs/toolkit';

import type { RootState } from './index';

export interface Calendar {
  id: number;
  owner: number;
  name: string;
  description: string | null;
  color: string | null;
  prod_id: string;
  ical_version: string;
  calscale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type CalendarInput = Partial<
  Omit<Calendar, 'id' | 'owner' | 'prod_id' | 'ical_version' | 'calscale' | 'created_at' | 'updated_at'>
> & {
  name: string;
};

// Everything lives in memory only, so state resets on every page refresh.
interface CalendarsState {
  items: Calendar[];
  nextId: number;
}

function buildCalendar(id: number, input: CalendarInput): Calendar {
  const now = new Date().toISOString();
  return {
    id,
    owner: 1,
    name: input.name,
    description: input.description ?? null,
    color: input.color ?? null,
    prod_id: '-//Expo Calendar//EN',
    ical_version: '2.0',
    calscale: 'GREGORIAN',
    timezone: input.timezone ?? 'UTC',
    created_at: now,
    updated_at: now,
  };
}

const initialState: CalendarsState = {
  // Start with one calendar so events can be created right away.
  items: [buildCalendar(1, { name: 'Personal', color: '#3B82F6' })],
  nextId: 2,
};

const calendarsSlice = createSlice({
  name: 'calendars',
  initialState,
  reducers: {
    // Dispatched via the createCalendar thunk below, which picks the id.
    addCalendar(state, action: PayloadAction<Calendar>) {
      state.items.push(action.payload);
      state.nextId = action.payload.id + 1;
    },
  },
});

// Thunk so callers get the new calendar back (e.g. to auto-select it).
export const createCalendar =
  (input: CalendarInput): ThunkAction<Calendar, RootState, unknown, UnknownAction> =>
  (dispatch, getState) => {
    const calendar = buildCalendar(getState().calendars.nextId, input);
    dispatch(calendarsSlice.actions.addCalendar(calendar));
    return calendar;
  };

export const selectCalendars = (state: RootState) => state.calendars.items;

export default calendarsSlice.reducer;
