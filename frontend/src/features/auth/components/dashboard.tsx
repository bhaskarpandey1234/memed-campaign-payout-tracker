'use client';

import { Button } from '@/components/ui/button';
import { BrandDashboard } from '@/features/campaigns';
import { CreatorDashboard } from '@/features/submissions';
import { logout } from '../api/auth.api';
import type { User } from '../types';

export function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  return <main className="shell"><div className="row"><div><h1>Welcome, {user.email}</h1><span className="pill">{user.role}</span></div><Button variant="secondary" onClick={() => { logout().then(() => onLogout()); }}>Log out</Button></div>{user.role === 'brand' ? <BrandDashboard /> : <CreatorDashboard />}</main>;
}
