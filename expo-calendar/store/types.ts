// Mirrors the serializers in djangobackend/backend_api/serializers.py.
// Dates/times arrive as ISO 8601 strings; `duration` uses Django's
// DurationField format ("[DD ]HH:MM:SS").

export interface User {
  id: number;
  email: string;
  display_name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type UserInput = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>> & {
  email: string;
  display_name: string;
  // Write-only on the API; never returned.
  password?: string;
};

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
