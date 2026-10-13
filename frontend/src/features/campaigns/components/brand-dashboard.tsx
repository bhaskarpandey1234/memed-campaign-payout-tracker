'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatRupees } from '@/lib/format/currency';
import { createCampaign, getMyCampaigns } from '../api/campaigns.api';
import type { Campaign } from '../types';

export function BrandDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [budget, setBudget] = useState('100000');
  const [miles, setMiles] = useState('10000:500,50000:2000,100000:5000');
  const [creating, setCreating] = useState(false);

  async function load() {
    const response = await getMyCampaigns();
    setCampaigns(response.campaigns);
  }

  useEffect(() => {
    load().catch((error) => { setMessage(error.message); setMessageType('error'); });
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    setMessage('');
    try {
      const milestones = miles.split(',').map((entry) => {
        const [threshold, payout] = entry.split(':');
        return { threshold: Number(threshold), payout: Number(payout) };
      });
      await createCampaign({ name, platform, totalBudget: Number(budget), milestones });
      setMessage('Campaign created');
      setMessageType('success');
      setName('');
      await load();
    } catch (error) {
      setMessage((error as Error).message);
      setMessageType('error');
    } finally {
      setCreating(false);
    }
  }

  return <><div className="grid"><form className="card" onSubmit={create}><h2>Create campaign</h2><label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value)}><option>Instagram</option><option>YouTube</option></select></label><label>Budget (paise)<input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} min="1" /></label><label>Milestones<input value={miles} onChange={(event) => setMiles(event.target.value)} /><small className="muted">Format: views:payout,views:payout</small></label><Button type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create campaign'}</Button>{message && <p className={messageType}>{message}</p>}</form><div className="card"><h2>Your campaigns</h2>{campaigns.map((campaign) => <div key={campaign._id} className="card" style={{ marginBottom: 10 }}><div className="row"><strong>{campaign.name}</strong><span className="pill">{campaign.platform}</span></div><p>Spent: {formatRupees(campaign.spent)} · Remaining: {formatRupees(campaign.remainingBudget)}</p><progress value={campaign.spent} max={campaign.totalBudget} /></div>)}{!campaigns.length && <p className="muted">No campaigns yet.</p>}</div></div></>;
}
