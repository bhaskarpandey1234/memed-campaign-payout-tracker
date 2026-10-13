'use client';
import { AuthScreen, Dashboard, useSession } from '@/features/auth';
export default function Home() { const { user, setUser } = useSession(); if (user) return <Dashboard user={user} onLogout={() => setUser(null)} />; return <AuthScreen onUser={setUser} />; }
