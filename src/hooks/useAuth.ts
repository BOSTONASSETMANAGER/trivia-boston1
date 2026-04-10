'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TriviaUser } from '@/types/game';
import {
  loadStoredUser,
  saveStoredUser,
  clearStoredUser,
} from '@/lib/auth/session';

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

  const logout = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  return { user, hydrated, setAuthenticated, logout };
}
