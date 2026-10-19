import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from './index';

export type EventStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
export type EventTransparency = 'OPAQUE' | 'TRANSPARENT';
export type EventClassification = 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';

export interface Event {
  id: number;
  calendar: number;
  uid: string;
  organizer: number | null;
  summary: string;
  description: string | null;
  location: string | null;
  dtstart: string;
  dtend: string | null;
  duration: string | null;
  is_all_day: boolean;
  timezone: string | null;
  rrule: string | null;
  rdate: string[];
  exdate: string[];
  recurrence_id: string | null;
  sequence: number;
  status: EventStatus;
  transp: EventTransparency;
  classification: EventClassification;
  priority: number | null;
  categories: string[];
  url: string | null;
  created_at: string;
  updated_at: string;
  dtstamp: string;
}

export type EventInput = Partial<
  Omit<Event, 'id' | 'uid' | 'created_at' | 'updated_at' | 'dtstamp'>
> & {
  calendar: number;
  summary: string;
  dtstart: string;
};

// Everything lives in memory only, so state resets on every page refresh.
interface EventsState {
  items: Event[];
  nextId: number;
}

const initialState: EventsState = {
  items: [],
  nextId: 1,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    createEvent(state, action: PayloadAction<EventInput>) {
      const now = new Date().toISOString();
      const input = action.payload;
      state.items.push({
        id: state.nextId,
        uid: nanoid(),
        organizer: null,
        description: null,
        location: null,
        dtend: null,
        duration: null,
        is_all_day: false,
        timezone: null,
        rrule: null,
        rdate: [],
        exdate: [],
        recurrence_id: null,
        sequence: 0,
        status: 'CONFIRMED',
        transp: 'OPAQUE',
        classification: 'PUBLIC',
        priority: null,
        categories: [],
        url: null,
        ...input,
        created_at: now,
        updated_at: now,
        dtstamp: now,
      });
      state.nextId += 1;
    },
    updateEvent(state, action: PayloadAction<{ id: number; changes: Partial<EventInput> }>) {
      const event = state.items.find((e) => e.id === action.payload.id);
      if (!event) return;
      Object.assign(event, action.payload.changes);
      event.sequence += 1;
      event.updated_at = new Date().toISOString();
    },
    deleteEvent(state, action: PayloadAction<number>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
  },
});

export const { createEvent, updateEvent, deleteEvent } = eventsSlice.actions;

export const selectEvents = (state: RootState) => state.events.items;
export const selectEventById = (id: number) => (state: RootState) =>
  state.events.items.find((e) => e.id === id);

export default eventsSlice.reducer;
