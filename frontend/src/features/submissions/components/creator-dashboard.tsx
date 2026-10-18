'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight, Camera, Compass, ExternalLink, FilePlus2, Layers3, Play, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge, Button, Card, EmptyState, ErrorState, Field, Input, Progress, Skeleton, StatCard } from '@/components/ui';
import { getLiveCampaigns, type Campaign } from '@/features/campaigns';
import { getMyEarnings } from '@/features/earnings';
import { formatRupeesIndian } from '@/lib/format/currency';
import { createSubmission, updateSubmissionViews } from '../api/submissions.api';
import { submissionUrlSchema } from '../schemas/submission.schema';
import type { Submission } from '../types';
import { ViewUpdateDialog } from './view-update-dialog';

type CreatorView = 'overview' | 'submissions' | 'campaigns';
const views: { id: CreatorView; label: string }[] = [{ id: 'overview', label: 'Overview' }, { id: 'submissions', label: 'My submissions' }, { id: 'campaigns', label: 'Explore campaigns' }];

export function CreatorDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<CreatorView>('overview');
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [dialogSubmission, setDialogSubmission] = useState<Submission | null>(null);
  const [dialogError, setDialogError] = useState('');

  async function load() {
    setStatus('loading');
    try { const [campaignResponse, earningsResponse] = await Promise.all([getLiveCampaigns(), getMyEarnings()]); setCampaigns(campaignResponse.campaigns); setEarnings(earningsResponse.totalEarnings); setSubmissions(earningsResponse.submissions); setStatus('ready'); setError(''); }
    catch (caught) { setError((caught as Error).message); setStatus('error'); }
  }
  useEffect(() => { void load(); }, []);

  async function submit(campaign: Campaign, postUrl: string) {
    const key = `submit-${campaign._id}`; setPending((items) => ({ ...items, [key]: true }));
    try { await createSubmission(campaign._id, postUrl); toast.success('Post submitted. It will start at 0 views.'); await refreshData(); return true; }
    catch (caught) { toast.error((caught as Error).message); return false; }
    finally { setPending((items) => ({ ...items, [key]: false })); }
  }

  async function refreshData() {
    const [campaignResponse, earningsResponse] = await Promise.all([getLiveCampaigns(), getMyEarnings()]); setCampaigns(campaignResponse.campaigns); setEarnings(earningsResponse.totalEarnings); setSubmissions(earningsResponse.submissions);
  }

  async function update(viewsCount: number) {
    if (!dialogSubmission) return;
    const key = `views-${dialogSubmission._id}`; setPending((items) => ({ ...items, [key]: true })); setDialogError('');
    try { await updateSubmissionViews(dialogSubmission._id, viewsCount); await refreshData(); toast.success('Views updated and payout recalculated.'); setDialogSubmission(null); }
    catch (caught) { setDialogError((caught as Error).message); }
    finally { setPending((items) => ({ ...items, [key]: false })); }
  }

  return <div className="min-w-0 space-y-7"><section className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="min-w-0"><p className="text-sm font-bold tracking-wide text-primary">CREATOR WORKSPACE</p><h1 className="workspace-heading display-font mt-1 text-4xl font-semibold text-ink sm:text-5xl">Make the work visible. Keep the payout clear.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Explore live opportunities, submit your post, and watch each milestone turn into earnings.</p></div><div className="shrink-0 self-start rounded-xl border border-primary/15 bg-primary-soft px-3 py-2 text-sm font-semibold text-primary sm:self-auto">{formatRupeesIndian(earnings)} earned</div></section>
    <nav aria-label="Creator workspace sections" className="workspace-tabs flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">{views.map((view) => <button key={view.id} onClick={() => setActiveView(view.id)} className={`focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${activeView === view.id ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-canvas hover:text-ink'}`}>{view.label}</button>)}</nav>
    {status === 'loading' ? <CreatorSkeleton /> : status === 'error' ? <ErrorState message={error} onRetry={() => void load()} /> : <>
      {activeView === 'overview' && <CreatorOverview earnings={earnings} submissions={submissions} campaigns={campaigns} onCampaigns={() => setActiveView('campaigns')} onSubmissions={() => setActiveView('submissions')} />}
      {activeView === 'submissions' && <SubmissionList submissions={submissions} onUpdate={(submission) => { setDialogError(''); setDialogSubmission(submission); }} />}
      {activeView === 'campaigns' && <CampaignList campaigns={campaigns} pending={pending} onSubmit={submit} />}
    </>}
    <ViewUpdateDialog submission={dialogSubmission} onClose={() => { if (!dialogSubmission || !pending[`views-${dialogSubmission._id}`]) setDialogSubmission(null); }} onSave={update} saving={Boolean(dialogSubmission && pending[`views-${dialogSubmission._id}`])} requestError={dialogError} />
  </div>;
}

function CreatorOverview({ earnings, submissions, campaigns, onCampaigns, onSubmissions }: { earnings: number; submissions: Submission[]; campaigns: Campaign[]; onCampaigns: () => void; onSubmissions: () => void }) {
  const capped = submissions.filter((submission) => submission.budgetCapped).length;
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total earnings" value={formatRupeesIndian(earnings)} detail="Across every credited post" accent="success" /><StatCard label="Your submissions" value={submissions.length} detail="Posts being tracked" /><StatCard label="Live opportunities" value={campaigns.length} detail="Campaigns ready to join" accent="accent" /><StatCard label="Budget-capped posts" value={capped} detail={capped ? 'Some campaign budgets are exhausted' : 'All payouts can keep growing'} /></div><div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]"><Card><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-ink">Latest submissions</h2><p className="mt-1 text-sm text-muted">Keep an eye on the posts turning views into payouts.</p></div><Button size="sm" variant="ghost" onClick={onSubmissions}>View all</Button></div><div className="mt-5 space-y-3">{submissions.slice(0, 3).map((submission) => <SubmissionMini key={submission._id} submission={submission} />)}{!submissions.length && <div className="py-8 text-center text-sm text-muted">Your submitted posts will appear here.</div>}</div></Card><Card className="flex flex-col justify-between bg-[#28203c] text-white"><div><div className="grid size-11 place-items-center rounded-xl bg-white/10 text-[#d9caff]"><Compass className="size-5" /></div><h2 className="display-font mt-5 text-3xl font-semibold">Find your next brief.</h2><p className="mt-3 text-sm leading-6 text-white/70">New campaigns are ready when a brand has budget left to reward great reach.</p></div><Button className="mt-7 w-full bg-white text-primary hover:bg-[#f0ebff]" onClick={onCampaigns}>Explore live campaigns<ArrowUpRight className="size-4" /></Button></Card></div></div>;
}

function CampaignList({ campaigns, pending, onSubmit }: { campaigns: Campaign[]; pending: Record<string, boolean>; onSubmit: (campaign: Campaign, url: string) => Promise<boolean> }) {
  if (!campaigns.length) return <EmptyState icon={<Compass className="size-6" />} title="No live campaigns right now" description="When brands publish a campaign with budget remaining, it will appear here." />;
  return <div className="grid gap-4 xl:grid-cols-2">{campaigns.map((campaign) => <CampaignSubmissionCard key={campaign._id} campaign={campaign} loading={Boolean(pending[`submit-${campaign._id}`])} onSubmit={onSubmit} />)}</div>;
}

function CampaignSubmissionCard({ campaign, loading, onSubmit }: { campaign: Campaign; loading: boolean; onSubmit: (campaign: Campaign, url: string) => Promise<boolean> }) {
  const form = useForm<{ postUrl: string }>({ resolver: zodResolver(submissionUrlSchema(campaign.platform)), defaultValues: { postUrl: '' }, mode: 'onBlur', reValidateMode: 'onChange' });
  const Icon = campaign.platform === 'Instagram' ? Camera : Play;
  return <Card className="flex flex-col"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5" /></span><div><h2 className="text-lg font-bold text-ink">{campaign.name}</h2><p className="mt-1 text-sm text-muted">{campaign.platform} · {campaign.milestones.length} milestones</p></div></div><Badge tone="success">Live</Badge></div><div className="mt-5 rounded-xl bg-canvas p-4"><div className="flex items-baseline justify-between gap-4"><p className="text-sm font-medium text-muted">Available campaign budget</p><p className="text-lg font-bold text-ink">{formatRupeesIndian(campaign.remainingBudget)}</p></div><div className="mt-4 space-y-2">{campaign.milestones.map((milestone, index) => <div key={milestone.threshold} className="flex items-center gap-3 text-sm"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">{index + 1}</span><span className="text-muted">{milestone.threshold.toLocaleString('en-IN')} views</span><span className="ml-auto font-bold text-ink">{formatRupeesIndian(milestone.payout)}</span></div>)}</div></div><form className="mt-5" onSubmit={form.handleSubmit(async (values) => { if (await onSubmit(campaign, values.postUrl.trim())) form.reset(); })} noValidate><Field label="Your published post link" hint={campaign.platform} error={form.formState.errors.postUrl?.message}><Input hasError={Boolean(form.formState.errors.postUrl)} placeholder={campaign.platform === 'Instagram' ? 'https://instagram.com/p/…' : 'https://youtube.com/watch?v=…'} {...form.register('postUrl')} /></Field><Button type="submit" className="mt-4 w-full" loading={loading} loadingLabel="Submitting post…"><FilePlus2 className="size-4" />Submit post</Button></form></Card>;
}

function SubmissionList({ submissions, onUpdate }: { submissions: Submission[]; onUpdate: (submission: Submission) => void }) {
  if (!submissions.length) return <EmptyState icon={<Layers3 className="size-6" />} title="No posts submitted yet" description="Browse live campaigns, submit a published link, and we’ll track the payout journey here." />;
  return <div className="grid gap-4 xl:grid-cols-2">{submissions.map((submission) => <SubmissionCard key={submission._id} submission={submission} onUpdate={() => onUpdate(submission)} />)}</div>;
}

function SubmissionCard({ submission, onUpdate }: { submission: Submission; onUpdate: () => void }) {
  const campaign = typeof submission.campaign === 'string' ? null : submission.campaign;
  const platform = campaign?.platform || 'Campaign'; const Icon = platform === 'Instagram' ? Camera : Play;
  return <Card className="space-y-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5" /></span><div><h2 className="font-bold text-ink">{campaign?.name || 'Campaign submission'}</h2><p className="mt-1 text-sm text-muted">{platform}</p></div></div>{submission.budgetCapped ? <Badge tone="warning">Budget capped</Badge> : <Badge tone="success">Tracking</Badge>}</div><a href={submission.postUrl} target="_blank" rel="noreferrer" className="focus-ring flex items-center gap-2 truncate rounded-lg bg-canvas px-3 py-2 text-sm text-muted hover:text-primary"><ExternalLink className="size-4 shrink-0" />{submission.postUrl}</a><div className="grid grid-cols-2 gap-3"><div><p className="text-xs font-medium text-muted">Current views</p><p className="mt-1 text-xl font-bold text-ink">{submission.views.toLocaleString('en-IN')}</p></div><div><p className="text-xs font-medium text-muted">Payout credited</p><p className="mt-1 text-xl font-bold text-success">{formatRupeesIndian(submission.creditedPayout)}</p></div></div>{submission.budgetCapped && <div className="rounded-xl border border-warning/20 bg-warning-soft px-3 py-2 text-sm text-warning">The campaign has no remaining budget for future payout increases.</div>}<Button variant="secondary" className="w-full" onClick={onUpdate}><TrendingUp className="size-4" />Simulate views</Button></Card>;
}

function SubmissionMini({ submission }: { submission: Submission }) { const campaign = typeof submission.campaign === 'string' ? null : submission.campaign; return <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-4"><div className="min-w-0"><p className="truncate font-bold text-ink">{campaign?.name || 'Campaign submission'}</p><p className="mt-1 text-xs text-muted">{submission.views.toLocaleString('en-IN')} views</p></div><p className="shrink-0 text-sm font-bold text-success">{formatRupeesIndian(submission.creditedPayout)}</p></div>; }

function CreatorSkeleton() { return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36" />)}</div><Skeleton className="h-72" /></div>; }
