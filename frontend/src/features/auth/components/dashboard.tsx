'use client';

import { CircleDollarSign, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AccountMenu, AccountMenuItem, Badge, Button } from '@/components/ui';
import { initials } from '@/lib/utils';
import { BrandDashboard } from '@/features/campaigns';
import { CreatorDashboard } from '@/features/submissions';
import { logout } from '../api/auth.api';
import type { User } from '../types';

export function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [loggingOut, setLoggingOut] = useState(false);
  async function handleLogout() {
    setLoggingOut(true);
    try { await logout(); onLogout(); toast.success('You have been signed out.'); }
    catch (error) { toast.error((error as Error).message); }
    finally { setLoggingOut(false); }
  }

  return <main className="min-h-screen min-w-0 overflow-x-clip bg-canvas"><header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl min-w-0 items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm"><CircleDollarSign className="size-5" /></span><div className="min-w-0"><p className="font-bold leading-none text-ink">Meme&apos;d</p><p className="mt-1 text-[10px] font-bold tracking-[.16em] text-muted">PAYOUT STUDIO</p></div></div><div className="flex shrink-0 items-center gap-3"><Badge tone={user.role === 'brand' ? 'primary' : 'success'}>{user.role === 'brand' ? 'Brand workspace' : 'Creator workspace'}</Badge><AccountMenu trigger={<button aria-label="Open account menu" className="focus-ring grid size-9 place-items-center rounded-full bg-ink text-xs font-bold text-white hover:bg-primary">{initials(user.email)}</button>}><div className="border-b border-line px-3 py-2"><p className="truncate text-sm font-bold text-ink">{user.email}</p><p className="mt-0.5 text-xs capitalize text-muted">{user.role}</p></div><AccountMenuItem destructive onSelect={handleLogout}><LogOut className="size-4" />{loggingOut ? 'Signing out…' : 'Sign out'}</AccountMenuItem></AccountMenu></div></div></header>
    <div className="mx-auto max-w-7xl min-w-0 px-4 py-7 sm:px-6 lg:px-8">{user.role === 'brand' ? <BrandDashboard /> : <CreatorDashboard />}</div>
    <footer className="mx-auto max-w-7xl min-w-0 px-4 pb-8 pt-3 text-xs text-muted sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-2"><UserRound className="size-3.5 shrink-0" />Your payout data is synced securely to your account.</div></footer>
  </main>;
}
