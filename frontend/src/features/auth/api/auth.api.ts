import { api } from '@/lib/api/client';
import type { Role, User } from '../types';

export function getCurrentUser() {
  return api<{ user: User }>('/auth/me');
}

export function login(input: { email: string; password: string }) {
  return api<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export function signup(input: { email: string; password: string; role: Role }) {
  return api<{ user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(input) });
}

export function logout() {
  return api<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}
