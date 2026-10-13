'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/auth.api';
import type { User } from '../types';

export function useSession() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((response) => {
        if (mounted) setUser(response.user);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  return { user, setUser };
}
