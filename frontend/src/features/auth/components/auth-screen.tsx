'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { login, signup } from '../api/auth.api';
import type { Role, User } from '../types';

type Mode = 'login' | 'signup';

export function AuthScreen({ onUser }: { onUser: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');

  return (
    <main className="shell">
      <div className="card" style={{ maxWidth: 480, margin: '10vh auto' }}>
        <h1>Meme&apos;d Payout Tracker</h1>
        <p className="muted">
          {mode === 'login' ? 'Sign in to manage campaigns and earnings.' : 'Create a brand or creator account.'}
        </p>
        <AuthForm mode={mode} onUser={onUser} onError={setError} />
        {error && <p className="error">{error}</p>}
        <Button variant="secondary" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already registered? Log in'}
        </Button>
      </div>
    </main>
  );
}

function AuthForm({ mode, onUser, onError }: { mode: Mode; onUser: (user: User) => void; onError: (message: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('creator');

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const response = mode === 'login'
        ? await login({ email, password })
        : await signup({ email, password, role });
      onUser(response.user);
    } catch (caught) {
      onError((caught as Error).message);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></label>
      {mode === 'signup' && <label>Role<select value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="creator">Creator</option><option value="brand">Brand</option></select></label>}
      <Button type="submit">{mode === 'login' ? 'Log in' : 'Create account'}</Button>
    </form>
  );
}
