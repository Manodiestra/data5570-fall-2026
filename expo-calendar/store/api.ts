import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '@/lib/api-config';

export type EventStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
export type EventTransparency = 'OPAQUE' | 'TRANSPARENT';
export type EventClassification = 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';

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

export type CalendarInput = Partial<
  Omit<Calendar, 'id' | 'owner' | 'prod_id' | 'ical_version' | 'calscale' | 'created_at' | 'updated_at'>
> & {
  name: string;
};

export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Calendar', 'Event'],
  endpoints: (builder) => ({
    getCalendars: builder.query<Calendar[], void>({
      query: () => 'calendars/',
      providesTags: (result) =>
        result
          ? [
              ...result.map((calendar) => ({ type: 'Calendar' as const, id: calendar.id })),
              { type: 'Calendar' as const, id: 'LIST' },
            ]
          : [{ type: 'Calendar' as const, id: 'LIST' }],
    }),
    createCalendar: builder.mutation<Calendar, CalendarInput>({
      query: (body) => ({ url: 'calendars/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Calendar', id: 'LIST' }],
    }),
    getEvents: builder.query<Event[], void>({
      query: () => 'events/',
      providesTags: (result) =>
        result
          ? [
              ...result.map((event) => ({ type: 'Event' as const, id: event.id })),
              { type: 'Event' as const, id: 'LIST' },
            ]
          : [{ type: 'Event' as const, id: 'LIST' }],
    }),
    getEvent: builder.query<Event, number>({
      query: (id) => `events/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Event' as const, id }],
    }),
    createEvent: builder.mutation<Event, EventInput>({
      query: (body) => ({ url: 'events/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),
    updateEvent: builder.mutation<Event, { id: number; changes: EventInput }>({
      query: ({ id, changes }) => ({ url: `events/${id}/`, method: 'PATCH', body: changes }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
      ],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({ url: `events/${id}/`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCalendarsQuery,
  useCreateCalendarMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = calendarApi;
