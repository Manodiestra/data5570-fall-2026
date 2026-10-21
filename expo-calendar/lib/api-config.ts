// Points at the local Django dev server (`python manage.py runserver`) by
// default. Override with EXPO_PUBLIC_API_URL in a .env file, e.g.
// EXPO_PUBLIC_API_URL=https://calendar-api-jhr2.onrender.com/api/ for the
// deployed backend.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:8000/api/';
