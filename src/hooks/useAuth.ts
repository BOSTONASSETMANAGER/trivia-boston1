'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TriviaUser } from '@/types/game';
import {
  loadStoredUser,
  saveStoredUser,
  clearStoredUser,
} from '@/lib/auth/session';
import { logoutUser } from '@/app/actions/auth';

export function useAuth() {
  const [user, setUser] = useState<TriviaUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadStoredUser());
    setHydrated(true);
  }, []);

  const setAuthenticated = useCallback((u: TriviaUser) => {
    saveStoredUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    clearStoredUser();
    setUser(null);
    try {
      await logoutUser();
    } catch {
      /* best-effort: cookie still cleared by the next request */
    }
  }, []);

  // Used when the server tells us our session was displaced. Skips the
  // server roundtrip — the session is already revoked in the DB.
  const handleSessionExpired = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  return { user, hydrated, setAuthenticated, logout, handleSessionExpired };
}
