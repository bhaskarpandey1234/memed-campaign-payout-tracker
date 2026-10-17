import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Card } from '@/components/ui';

export default function NotFound() {
  return <main className="app-grid flex min-h-screen items-center justify-center bg-canvas p-6"><Card className="max-w-md text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><Compass className="size-6" /></div><h1 className="display-font mt-5 text-3xl font-semibold text-ink">This page isn&apos;t on the brief.</h1><p className="mt-3 text-sm leading-6 text-muted">The destination may have moved, or the link may be incomplete.</p><Link className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover" href="/">Return to Meme&apos;d</Link></Card></main>;
}
