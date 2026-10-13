'use client';

import { useEffect, useState } from 'react';
import { getLiveCampaigns, LiveCampaignCard, type Campaign } from '@/features/campaigns';
import { EarningsSummary, getMyEarnings } from '@/features/earnings';
import { createSubmission, updateSubmissionViews } from '../api/submissions.api';
import type { Submission } from '../types';
import { SubmissionCard } from './submission-card';

export function CreatorDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  async function load() { const [campaignResponse, earningsResponse] = await Promise.all([getLiveCampaigns(), getMyEarnings()]); setCampaigns(campaignResponse.campaigns); setEarnings(earningsResponse.totalEarnings); setSubmissions(earningsResponse.submissions); }
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);
  async function submit(campaign: Campaign) { if (pending) return; setPending(`new-${campaign._id}`); setMessage(''); try { await createSubmission(campaign._id, links[campaign._id] || ''); setLinks({ ...links, [campaign._id]: '' }); await load(); setMessage('Post submitted'); } catch (error) { setMessage((error as Error).message); } finally { setPending(null); } }
  async function update(submission: Submission) { if (pending) return; const raw = prompt(`New view count for ${submission.postUrl}`); if (raw === null) return; const views = Number(raw); if (!Number.isInteger(views) || views < 0) { setMessage('Views must be a non-negative whole number'); return; } setPending(submission._id); setMessage(''); try { await updateSubmissionViews(submission._id, views); await load(); setMessage('Views updated and payout recalculated'); } catch (error) { setMessage((error as Error).message); } finally { setPending(null); } }
  return <><EarningsSummary earnings={earnings} message={message} /><h2>Your submissions</h2>{submissions.length ? <div className="grid">{submissions.map((submission) => <SubmissionCard key={submission._id} submission={submission} pending={pending !== null} onUpdate={() => update(submission)} />)}</div> : <p className="muted">No posts submitted yet.</p>}<h2>Live campaigns</h2><div className="grid">{campaigns.map((campaign) => <LiveCampaignCard key={campaign._id} campaign={campaign} link={links[campaign._id] || ''} disabled={pending !== null} submitting={pending === `new-${campaign._id}`} onLinkChange={(value) => setLinks({ ...links, [campaign._id]: value })} onSubmit={() => submit(campaign)} />)}</div>{!campaigns.length && <p className="muted">No live campaigns available.</p>}</>;
}
