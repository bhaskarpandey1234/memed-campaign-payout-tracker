import { formatRupees } from '@/lib/format/currency';

export function EarningsSummary({ earnings, message }: { earnings: number; message: string }) {
  return <div className="card"><h2>Total earnings: {formatRupees(earnings)}</h2>{message && <p className="success">{message}</p>}</div>;
}
