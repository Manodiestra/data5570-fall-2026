import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';

// A read-only mirror of the Supabase session, kept in sync by
// components/auth/AuthListener.tsx. The Supabase client stays the source of
// truth: it persists the session and refreshes tokens. Redux just makes the
// current state available synchronously to components and to RTK Query's
// prepareHeaders. Sign in/out by calling `supabase.auth` directly.
interface AuthState {
  // 'loading' until the persisted session (if any) has been restored.
  status: 'loading' | 'signedIn' | 'signedOut';
  accessToken: string | null;
  user: { id: string; email: string | null } | null;
}

const initialState: AuthState = {
  status: 'loading',
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionChanged(state, action: PayloadAction<Session | null>) {
      const session = action.payload;
      state.status = session ? 'signedIn' : 'signedOut';
      state.accessToken = session?.access_token ?? null;
      state.user = session ? { id: session.user.id, email: session.user.email ?? null } : null;
    },
  },
});

export const { sessionChanged } = authSlice.actions;
export default authSlice.reducer;
