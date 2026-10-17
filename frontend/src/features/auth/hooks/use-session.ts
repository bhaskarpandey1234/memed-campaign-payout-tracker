'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/auth.api';
import type { User } from '../types';

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((response) => {
        if (mounted) {
          setUser(response.user);
          setStatus('authenticated');
        }
      })
      .catch(() => {
        if (mounted) setStatus('unauthenticated');
      });
    return () => {
      mounted = false;
    };
  }, []);

  function updateUser(next: User | null) {
    setUser(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
  }

  return { user, setUser: updateUser, status };
}
