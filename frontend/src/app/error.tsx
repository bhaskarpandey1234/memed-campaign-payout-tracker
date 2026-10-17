'use client';

import { AlertTriangle } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="app-grid flex min-h-screen items-center justify-center bg-canvas p-6"><Card className="max-w-md text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger-soft text-danger"><AlertTriangle className="size-6" /></div><h1 className="display-font mt-5 text-3xl font-semibold text-ink">That view hit a snag.</h1><p className="mt-3 text-sm leading-6 text-muted">Your data is safe. Try loading the workspace again, and if this continues, return in a moment.</p><Button className="mt-6" onClick={reset}>Try again</Button></Card></main>;
}
