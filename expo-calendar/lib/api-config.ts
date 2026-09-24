// Points at the deployed Django backend by default. Override for local dev
// with EXPO_PUBLIC_API_URL=http://localhost:8000/api/ in a .env file.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://calendar-api-jhr2.onrender.com/api/';
