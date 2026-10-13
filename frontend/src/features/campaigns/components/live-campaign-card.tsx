import { Button } from '@/components/ui/button';
import { formatRupees, formatRupeesIndian } from '@/lib/format/currency';
import type { Campaign } from '../types';

export function LiveCampaignCard({ campaign, link, disabled, submitting, onLinkChange, onSubmit }: { campaign: Campaign; link: string; disabled: boolean; submitting: boolean; onLinkChange: (value: string) => void; onSubmit: () => void }) {
  return <div className="card"><div className="row"><h3>{campaign.name}</h3><span className="pill">{campaign.platform}</span></div><p>Remaining: {formatRupees(campaign.remainingBudget)}</p><div><strong>Earning criteria</strong>{campaign.milestones.map((milestone) => <div className="muted" key={milestone.threshold}>{milestone.threshold.toLocaleString()} views → {formatRupeesIndian(milestone.payout)}</div>)}</div><input placeholder={campaign.platform === 'Instagram' ? 'Instagram post URL' : 'YouTube video URL'} value={link} onChange={(event) => onLinkChange(event.target.value)} /><Button disabled={disabled} onClick={onSubmit}>{submitting ? 'Submitting…' : 'Submit post'}</Button></div>;
}
