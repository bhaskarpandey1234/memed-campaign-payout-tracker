import { Button } from '@/components/ui/button';
import { formatRupees } from '@/lib/format/currency';
import type { Submission } from '../types';

export function SubmissionCard({ submission, pending, onUpdate }: { submission: Submission; pending: boolean; onUpdate: () => void }) {
  const campaign = typeof submission.campaign === 'string' ? null : submission.campaign;
  return <div className="card"><div className="row"><strong>{campaign ? campaign.name : 'Campaign'}</strong><span className="pill">{campaign?.platform || ''}</span></div><p className="muted">{submission.postUrl}</p><p>Views: {submission.views.toLocaleString()} · Earned: {formatRupees(submission.creditedPayout)}</p>{submission.budgetCapped && <p className="muted">Budget cap reached</p>}<Button variant="secondary" disabled={pending} onClick={onUpdate}>{pending ? 'Updating…' : 'Simulate views'}</Button></div>;
}
