# Database Schema — Calendar App (MVP)

This schema covers the MVP feature set: users, calendars, and events, with
enough fields to import/export standard **iCalendar** (RFC 5545) data
without loss for the properties we support. Each table's fields are
annotated with the iCalendar property they correspond to, where applicable.

Tables:
- [`users`](#users)
- [`calendars`](#calendars)
- [`events`](#events)

---

## `users`

Application accounts. Maps to the `ORGANIZER` / `ATTENDEE` identity (`CN`,
`mailto:` URI) used inside iCalendar data, but is otherwise a normal auth
table.

| Column          | Type           | Constraints                      | Notes / iCalendar mapping |
|-----------------|----------------|-----------------------------------|----------------------------|
| `id`            | UUID / BigInt  | PK                                 | Internal identifier |
| `email`         | VARCHAR(254)   | UNIQUE, NOT NULL                   | Used to build `mailto:` URIs for `ORGANIZER`/`ATTENDEE` |
| `display_name`  | VARCHAR(255)   | NOT NULL                           | Maps to the `CN` (common name) parameter on `ORGANIZER`/`ATTENDEE` |
| `password_hash` | VARCHAR(255)   | NOT NULL                           | — |
| `timezone`      | VARCHAR(64)    | NOT NULL, default `"UTC"`          | IANA tz name (e.g. `America/Denver`); default `TZID` for events the user creates |
| `created_at`    | TIMESTAMPTZ    | NOT NULL, default now              | — |
| `updated_at`    | TIMESTAMPTZ    | NOT NULL, default now              | — |

---

## `calendars`

A named collection of events owned by a user. Maps to a single `VCALENDAR`
document when exported.

| Column         | Type           | Constraints                                   | Notes / iCalendar mapping |
|----------------|----------------|-------------------------------------------------|----------------------------|
| `id`           | UUID / BigInt  | PK                                               | Internal identifier |
| `owner_id`     | FK -> `users.id`| NOT NULL, ON DELETE CASCADE                    | Calendar owner |
| `name`         | VARCHAR(255)   | NOT NULL                                         | Display name (not a standard `VCALENDAR` property; used in the app UI) |
| `description`  | TEXT           | NULL                                             | Optional, app-level only |
| `color`        | VARCHAR(7)     | NULL                                             | Hex color for UI (not part of RFC 5545) |
| `prod_id`      | VARCHAR(255)   | NOT NULL, default `"-//data5570//calendar//EN"` | `PRODID` — identifies the product that generated the calendar |
| `ical_version` | VARCHAR(8)     | NOT NULL, default `"2.0"`                        | `VERSION` — iCalendar spec version |
| `calscale`     | VARCHAR(16)    | NOT NULL, default `"GREGORIAN"`                  | `CALSCALE` |
| `timezone`     | VARCHAR(64)    | NOT NULL, default `"UTC"`                        | Default `TZID` for events on this calendar; used to resolve floating (timezone-less) times |
| `created_at`   | TIMESTAMPTZ    | NOT NULL, default now                            | — |
| `updated_at`   | TIMESTAMPTZ    | NOT NULL, default now                            | — |

---

## `events`

A single event, corresponding to one `VEVENT` component inside a
`VCALENDAR`. Recurring events are stored as a single row with an `RRULE`;
individual overridden occurrences are stored as separate rows linked via
`recurrence_id` (see below).

| Column           | Type              | Constraints                              | Notes / iCalendar mapping |
|------------------|-------------------|--------------------------------------------|----------------------------|
| `id`             | UUID / BigInt     | PK                                         | Internal identifier |
| `calendar_id`    | FK -> `calendars.id` | NOT NULL, ON DELETE CASCADE             | Which calendar this event belongs to |
| `uid`            | VARCHAR(255)      | UNIQUE, NOT NULL                           | `UID` — globally unique identifier for the event, stable across edits/exports |
| `organizer_id`   | FK -> `users.id`  | NULL                                        | `ORGANIZER` — resolved to a `mailto:` URI + `CN` on export |
| `summary`        | VARCHAR(255)      | NOT NULL                                   | `SUMMARY` — short title |
| `description`    | TEXT              | NULL                                       | `DESCRIPTION` — long-form notes |
| `location`       | VARCHAR(255)      | NULL                                       | `LOCATION` |
| `dtstart`        | TIMESTAMPTZ       | NOT NULL                                   | `DTSTART` |
| `dtend`          | TIMESTAMPTZ       | NULL                                       | `DTEND` — mutually exclusive with `duration` per RFC 5545 |
| `duration`       | INTERVAL          | NULL                                       | `DURATION` — used instead of `dtend` when only a length is known |
| `is_all_day`     | BOOLEAN           | NOT NULL, default `false`                  | Distinguishes `DATE` (all-day) from `DATE-TIME` value type on `DTSTART`/`DTEND` |
| `timezone`       | VARCHAR(64)       | NULL                                        | `TZID` parameter on `DTSTART`/`DTEND`; NULL implies UTC or floating time |
| `rrule`          | VARCHAR(500)      | NULL                                        | `RRULE` — recurrence rule string (e.g. `FREQ=WEEKLY;BYDAY=MO`) |
| `rdate`          | TEXT[] / JSON     | NULL                                        | `RDATE` — explicit extra recurrence dates |
| `exdate`         | TEXT[] / JSON     | NULL                                        | `EXDATE` — dates excluded from the recurrence set |
| `recurrence_id`  | TIMESTAMPTZ       | NULL                                        | `RECURRENCE-ID` — set when this row overrides a single occurrence of another event's `RRULE` |
| `sequence`       | INTEGER           | NOT NULL, default `0`                      | `SEQUENCE` — revision counter, incremented on each update |
| `status`         | VARCHAR(16)       | NOT NULL, default `"CONFIRMED"`            | `STATUS` — one of `TENTATIVE`, `CONFIRMED`, `CANCELLED` |
| `transp`         | VARCHAR(16)       | NOT NULL, default `"OPAQUE"`               | `TRANSP` — `OPAQUE` (busy) or `TRANSPARENT` (free), for free/busy lookups |
| `classification` | VARCHAR(16)      | NOT NULL, default `"PUBLIC"`               | `CLASS` — `PUBLIC`, `PRIVATE`, or `CONFIDENTIAL` |
| `priority`       | SMALLINT          | NULL                                        | `PRIORITY` — 0–9, 0 = undefined |
| `categories`      | TEXT[] / JSON    | NULL                                        | `CATEGORIES` — comma-separated tags |
| `url`            | VARCHAR(2048)     | NULL                                        | `URL` — link associated with the event |
| `created_at`     | TIMESTAMPTZ       | NOT NULL, default now                      | `CREATED` |
| `updated_at`     | TIMESTAMPTZ       | NOT NULL, default now                      | `LAST-MODIFIED` |
| `dtstamp`        | TIMESTAMPTZ       | NOT NULL, default now                      | `DTSTAMP` — timestamp of last export/generation |

### Notes

- **Attendees** are not modeled as a table yet; the MVP treats `organizer_id`
  as the only participant. A future `event_attendees` join table
  (`event_id`, `user_id`, `role`, `participation_status`, `rsvp`) would map
  to repeated `ATTENDEE` properties.
- **Alarms/reminders** (`VALARM`) are out of scope for the MVP and would
  become a separate `event_alarms` table.
- `dtend` and `duration` are mutually exclusive, matching the RFC 5545
  constraint that a `VEVENT` may specify at most one of the two.
