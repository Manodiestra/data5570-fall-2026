import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_BASE_URL } from '@/lib/api-config';

import type { Calendar, CalendarInput, Event, EventInput, User, UserInput } from './types';

// Routes come from the DRF DefaultRouter in djangobackend/backend_api/urls.py,
// which requires trailing slashes. List endpoints aren't paginated, so they
// return plain arrays.
type Update<T> = { id: number; changes: Partial<T> };

// Tag each item by id plus a LIST tag, so creates/deletes refetch lists and
// updates refetch only the lists/details that contain that item.
function provideList<T extends string>(type: T, items: { id: number }[] | undefined) {
  return items
    ? [...items.map(({ id }) => ({ type, id })), { type, id: 'LIST' as const }]
    : [{ type, id: 'LIST' as const }];
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['User', 'Calendar', 'Event'],
  endpoints: (build) => ({
    // Users
    getUsers: build.query<User[], void>({
      query: () => 'users/',
      providesTags: (result) => provideList('User', result),
    }),
    getUser: build.query<User, number>({
      query: (id) => `users/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: build.mutation<User, UserInput>({
      query: (body) => ({ url: 'users/', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: build.mutation<User, Update<UserInput>>({
      query: ({ id, changes }) => ({ url: `users/${id}/`, method: 'PATCH', body: changes }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),
    deleteUser: build.mutation<void, number>({
      query: (id) => ({ url: `users/${id}/`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // Calendars
    getCalendars: build.query<Calendar[], void>({
      query: () => 'calendars/',
      providesTags: (result) => provideList('Calendar', result),
    }),
    getCalendar: build.query<Calendar, number>({
      query: (id) => `calendars/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Calendar', id }],
    }),
    createCalendar: build.mutation<Calendar, CalendarInput>({
      query: (body) => ({ url: 'calendars/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Calendar', id: 'LIST' }],
    }),
    updateCalendar: build.mutation<Calendar, Update<CalendarInput>>({
      query: ({ id, changes }) => ({ url: `calendars/${id}/`, method: 'PATCH', body: changes }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Calendar', id }],
    }),
    deleteCalendar: build.mutation<void, number>({
      query: (id) => ({ url: `calendars/${id}/`, method: 'DELETE' }),
      // Deleting a calendar cascades to its events on the server.
      invalidatesTags: (_result, _error, id) => [
        { type: 'Calendar', id },
        { type: 'Calendar', id: 'LIST' },
        { type: 'Event', id: 'LIST' },
      ],
    }),

    // Events
    getEvents: build.query<Event[], void>({
      query: () => 'events/',
      providesTags: (result) => provideList('Event', result),
    }),
    getEvent: build.query<Event, number>({
      query: (id) => `events/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Event', id }],
    }),
    createEvent: build.mutation<Event, EventInput>({
      query: (body) => ({ url: 'events/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }],
    }),
    updateEvent: build.mutation<Event, Update<EventInput>>({
      query: ({ id, changes }) => ({ url: `events/${id}/`, method: 'PATCH', body: changes }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Event', id }],
    }),
    deleteEvent: build.mutation<void, number>({
      query: (id) => ({ url: `events/${id}/`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetCalendarsQuery,
  useGetCalendarQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = api;
