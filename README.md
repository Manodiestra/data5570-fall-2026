# data5570-fall-2026

A class demo project: a calendar app that implements the functionality and features of iCalendar, closely following the iCalendar spec ([RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545)).

## Project Scope

### Phase 1: No User Auth

Phase 1 does **not** implement user authentication. The code base and database act as if there is only one user, and all data is associated with that single user.

### Guidelines for Implementation

- **Plan for auth later.** User auth (via Supabase) will be added later for multi-user support. Write models, APIs, and front-end state so that attaching data to a real user later is straightforward. For example, keep a user/owner association on user-owned records rather than assuming global data.
- **Follow iCalendar first.** Core features should map closely to iCalendar components and properties (e.g. `VCALENDAR`, `VEVENT`, `VTODO`, `RRULE`, etc.).
- **Non-iCalendar features are add-ons.** Features not supported by iCalendar will eventually be added as add-ons. Keep them separate from the core iCalendar data model so the core stays spec-aligned.
- **Database schema.** Base database schema decisions on [`docs/db_schemas.md`](docs/db_schemas.md), and update that file whenever the schema changes.

## Tech Stack

### Front End

- [Expo](https://expo.dev/) for mobile and web, hosted with EAS Hosting
  - The Expo app lives in `expo-calendar/` (TypeScript, Expo SDK 56, Expo Router, NativeWind/NativewindUI).
  - It is linked to an EAS project (owner `manodiestra`, slug `expo-calendar`; project ID in `app.json` under `extra.eas.projectId`).
- [react-hook-form](https://react-hook-form.com/) for forms
- State management: [Redux Toolkit](https://redux-toolkit.js.org/) with [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) for fetching and caching data from the Django API

### Back End

- [Django](https://www.djangoproject.com/) (with Django REST Framework serializers), deployable to either AWS EC2 or [Render](https://render.com/)
- The Django project (`djangobackend/`) uses a **single app**, `backend_api`, which already exists. Add new functionality to this app rather than creating more apps.

### Auth

- [Supabase](https://supabase.com/) handles user auth (planned, not in Phase 1).

## Development Setup

### Python Virtual Environment

The back end uses Django 6, which requires **Python 3.12 or newer**.

Keep the Python virtual environment (venv) out of the git repo. Put it in one of two places:

- the repo root (same directory as `.git`), where it is gitignored (`venv/`, `.venv/`, `env/`, and `ENV/` are already in `.gitignore`), or
- the parent directory (`../`).

```bash
# Option A: in the repo root (gitignored)
python3.12 -m venv .venv
source .venv/bin/activate

# Option B: in the parent directory
python3.12 -m venv ../venv
source ../venv/bin/activate

# Then install dependencies
pip install -r requirements.txt
```

### Running the Back End

```bash
cd djangobackend
python manage.py migrate
python manage.py runserver
```

The API is served under `http://127.0.0.1:8000/api/` (e.g. `GET /api/calendars/`).

### Running the Front End

```bash
cd expo-calendar
npm install
npm run web      # web in the browser
npm start        # native; uses a development build (expo-dev-client), not Expo Go
```

EAS builds use the `build:dev`, `build:preview`, and `build:prod` npm scripts (`eas build --profile ...`). These need the [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`) and an `eas.json` with those profiles.
