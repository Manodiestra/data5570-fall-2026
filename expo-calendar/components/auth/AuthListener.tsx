import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { api } from '@/store/api';
import { sessionChanged } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';

// Mirrors the Supabase session into Redux. onAuthStateChange fires
// INITIAL_SESSION right away with the persisted session (or null), then again
// on sign in, sign out and every token refresh.
export function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't await other supabase calls in here: the callback runs while the
      // client holds its auth lock, so doing that can deadlock.
      dispatch(sessionChanged(session));
      if (event === 'SIGNED_OUT') {
        // Drop cached data so the next user doesn't see the previous user's.
        dispatch(api.util.resetApiState());
      }
    });
    return () => subscription.unsubscribe();
  }, [dispatch]);

  return null;
}
