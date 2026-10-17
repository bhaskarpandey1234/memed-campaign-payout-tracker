'use client';
import { AuthScreen, Dashboard, useSession } from '@/features/auth';
import { Spinner } from '@/components/ui';

export default function Home() {
  const { user, setUser, status } = useSession();
  if (status === 'loading') return <main className="app-grid flex min-h-screen items-center justify-center p-6"><div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-sm font-semibold text-muted shadow-card"><Spinner className="text-primary" />Opening your workspace…</div></main>;
  if (user) return <Dashboard user={user} onLogout={() => setUser(null)} />;
  return <AuthScreen onUser={setUser} />;
}
