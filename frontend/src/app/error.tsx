'use client';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <main className="shell"><div className="card"><h1>Something went wrong</h1><button onClick={reset}>Try again</button></div></main>; }
