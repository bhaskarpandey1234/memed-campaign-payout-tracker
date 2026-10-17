import { Skeleton } from '@/components/ui';

export default function Loading() {
  return <main className="min-h-screen bg-canvas p-6"><div className="mx-auto max-w-7xl space-y-7"><Skeleton className="h-16 w-full" /><Skeleton className="h-12 w-72" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36" />)}</div><Skeleton className="h-80" /></div></main>;
}
