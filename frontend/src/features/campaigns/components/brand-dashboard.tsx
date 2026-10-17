'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, BriefcaseBusiness, CirclePlus, Layers3, Plus, Trash2, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge, Button, Card, EmptyState, ErrorState, Field, InlineAlert, Input, Progress, Select, Skeleton, StatCard } from '@/components/ui';
import { formatRupeesIndian, rupeesToPaise } from '@/lib/format/currency';
import { createCampaign, getMyCampaigns } from '../api/campaigns.api';
import { campaignFormSchema, type CampaignFormValues } from '../schemas/campaign.schema';
import type { Campaign } from '../types';

type BrandView = 'overview' | 'campaigns' | 'create';
const views: { id: BrandView; label: string }[] = [{ id: 'overview', label: 'Overview' }, { id: 'campaigns', label: 'Campaigns' }, { id: 'create', label: 'Create campaign' }];

const defaults: CampaignFormValues = { name: '', platform: 'Instagram', budget: '10000.00', milestones: [{ threshold: '10000', payout: '500.00' }, { threshold: '50000', payout: '2000.00' }, { threshold: '100000', payout: '5000.00' }] };

export function BrandDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<BrandView>('overview');
  const form = useForm<CampaignFormValues>({ resolver: zodResolver(campaignFormSchema), defaultValues: defaults, mode: 'onBlur', reValidateMode: 'onChange' });
  const milestones = useFieldArray({ control: form.control, name: 'milestones' });

  async function load({ background = false } = {}) {
    if (background) setRefreshing(true); else setStatus('loading');
    try { const response = await getMyCampaigns(); setCampaigns(response.campaigns); setStatus('ready'); setError(''); }
    catch (caught) { setError((caught as Error).message); setStatus('error'); }
    finally { setRefreshing(false); }
  }

  useEffect(() => { void load(); }, []);
  const totals = useMemo(() => campaigns.reduce((sum, campaign) => ({ budget: sum.budget + campaign.totalBudget, spent: sum.spent + campaign.spent, remaining: sum.remaining + campaign.remainingBudget }), { budget: 0, spent: 0, remaining: 0 }), [campaigns]);

  async function submit(values: CampaignFormValues) {
    const totalBudget = rupeesToPaise(values.budget);
    const parsedMilestones = values.milestones.map((milestone) => ({ threshold: Number(milestone.threshold), payout: rupeesToPaise(milestone.payout) }));
    if (totalBudget === null || parsedMilestones.some((milestone) => milestone.payout === null)) return;
    try {
      await createCampaign({ name: values.name.trim(), platform: values.platform, totalBudget, milestones: parsedMilestones.map((milestone) => ({ threshold: milestone.threshold, payout: milestone.payout! })) });
      toast.success('Campaign created and ready for creator submissions.');
      form.reset(defaults); setActiveView('campaigns'); await load({ background: true });
    } catch (caught) { toast.error((caught as Error).message); }
  }

  return <div className="space-y-7"><section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold tracking-wide text-primary">BRAND WORKSPACE</p><h1 className="display-font mt-1 text-4xl font-semibold text-ink sm:text-5xl">Campaigns with a clearer finish line.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Launch view-based collaborations, track spend as milestones are crossed, and keep every payout accountable.</p></div>{refreshing && <p className="text-sm font-medium text-muted">Refreshing campaign data…</p>}</section>
    <nav aria-label="Brand workspace sections" className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">{views.map((view) => <button key={view.id} onClick={() => setActiveView(view.id)} className={`focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${activeView === view.id ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-canvas hover:text-ink'}`}>{view.label}</button>)}</nav>
    {status === 'loading' ? <BrandSkeleton /> : status === 'error' ? <ErrorState message={error} onRetry={() => void load()} /> : <>
      {activeView === 'overview' && <Overview campaigns={campaigns} totals={totals} onCreate={() => setActiveView('create')} onCampaigns={() => setActiveView('campaigns')} />}
      {activeView === 'campaigns' && <CampaignList campaigns={campaigns} onCreate={() => setActiveView('create')} />}
      {activeView === 'create' && <Card><div className="mb-6 flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><CirclePlus className="size-5" /></span><div><h2 className="text-xl font-bold text-ink">Create a campaign</h2><p className="mt-1 text-sm text-muted">Set a clear budget and a payout ladder creators can understand at a glance.</p></div></div><form className="space-y-6" onSubmit={form.handleSubmit(submit)} noValidate><div className="grid gap-5 md:grid-cols-2"><Field label="Campaign name" required error={form.formState.errors.name?.message}><Input placeholder="Summer launch memes" hasError={Boolean(form.formState.errors.name)} {...form.register('name')} /></Field><Field label="Platform" required error={form.formState.errors.platform?.message}><Select ariaLabel="Campaign platform" value={form.watch('platform')} onValueChange={(value) => form.setValue('platform', value as CampaignFormValues['platform'], { shouldValidate: true })} options={[{ value: 'Instagram', label: 'Instagram' }, { value: 'YouTube', label: 'YouTube' }]} /></Field></div><Field label="Total campaign budget" hint="Rupees" required error={form.formState.errors.budget?.message}><Input inputMode="decimal" prefix="₹" placeholder="10000.00" hasError={Boolean(form.formState.errors.budget)} {...form.register('budget')} /></Field>
        <div className="rounded-2xl border border-line bg-canvas/45 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-ink">Milestone ladder</h3><p className="mt-1 text-sm text-muted">Each step must have more views and the same or a higher payout.</p></div><Button type="button" size="sm" variant="secondary" onClick={() => milestones.append({ threshold: '', payout: '' })}><Plus className="size-4" />Add milestone</Button></div><div className="mt-4 space-y-3">{milestones.fields.map((field, index) => <div key={field.id} className="grid items-start gap-3 rounded-xl border border-line bg-surface-raised p-3 sm:grid-cols-[1fr_1fr_auto]"><Field label={`Step ${index + 1} views`} error={form.formState.errors.milestones?.[index]?.threshold?.message}><Input inputMode="numeric" placeholder="10000" hasError={Boolean(form.formState.errors.milestones?.[index]?.threshold)} {...form.register(`milestones.${index}.threshold`)} /></Field><Field label="Payout" error={form.formState.errors.milestones?.[index]?.payout?.message}><Input inputMode="decimal" prefix="₹" placeholder="500.00" hasError={Boolean(form.formState.errors.milestones?.[index]?.payout)} {...form.register(`milestones.${index}.payout`)} /></Field><Button aria-label={`Remove milestone ${index + 1}`} type="button" size="sm" variant="ghost" className="mt-6 text-danger hover:bg-danger-soft hover:text-danger" disabled={milestones.fields.length === 1} onClick={() => milestones.remove(index)}><Trash2 className="size-4" /></Button></div>)}</div>{typeof form.formState.errors.milestones?.message === 'string' && <p className="mt-2 text-xs font-medium text-danger">{form.formState.errors.milestones.message}</p>}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5"><p className="text-xs text-muted">You can add more milestones at any time before publishing a new campaign.</p><Button type="submit" loading={form.formState.isSubmitting} loadingLabel="Creating campaign…">Create campaign</Button></div></form></Card>}
    </>}</div>;
}

function Overview({ campaigns, totals, onCreate, onCampaigns }: { campaigns: Campaign[]; totals: { budget: number; spent: number; remaining: number }; onCreate: () => void; onCampaigns: () => void }) {
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Campaigns" value={campaigns.length} detail="Created in your workspace" /><StatCard label="Allocated budget" value={formatRupeesIndian(totals.budget)} detail="Across all campaigns" accent="accent" /><StatCard label="Payouts credited" value={formatRupeesIndian(totals.spent)} detail="Views converted to earnings" accent="success" /><StatCard label="Still available" value={formatRupeesIndian(totals.remaining)} detail="Ready for future milestones" /></div><div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]"><Card><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-ink">Recent campaigns</h2><p className="mt-1 text-sm text-muted">A live readout of where your budget is going.</p></div><Button variant="ghost" size="sm" onClick={onCampaigns}>View all</Button></div><div className="mt-5 space-y-3">{campaigns.slice(0, 3).map((campaign) => <CampaignRow key={campaign._id} campaign={campaign} />)}{!campaigns.length && <div className="py-8 text-center text-sm text-muted">No campaigns yet—create your first one to start tracking budgets.</div>}</div></Card><Card className="flex flex-col justify-between bg-[#28203c] text-white"><div><div className="grid size-11 place-items-center rounded-xl bg-white/10 text-[#d9caff]"><BriefcaseBusiness className="size-5" /></div><h2 className="display-font mt-5 text-3xl font-semibold">Ready to brief creators?</h2><p className="mt-3 text-sm leading-6 text-white/70">Build a payout ladder that keeps the ambition high and the spend visible.</p></div><Button className="mt-7 w-full bg-white text-primary hover:bg-[#f0ebff]" onClick={onCreate}><Plus className="size-4" />Create campaign</Button></Card></div></div>;
}

function CampaignList({ campaigns, onCreate }: { campaigns: Campaign[]; onCreate: () => void }) {
  if (!campaigns.length) return <EmptyState icon={<Layers3 className="size-6" />} title="No campaigns yet" description="Start with a budget and a milestone ladder. Creators will see it as soon as it is live." action={<Button onClick={onCreate}><Plus className="size-4" />Create campaign</Button>} />;
  return <div className="grid gap-4 lg:grid-cols-2">{campaigns.map((campaign) => <Card key={campaign._id} className="space-y-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">{campaign.name}</h2><p className="mt-1 text-sm text-muted">{campaign.milestones.length} payout milestones</p></div><div className="flex gap-2"><Badge tone="primary">{campaign.platform}</Badge><Badge tone={campaign.status === 'exhausted' ? 'warning' : 'success'}>{campaign.status === 'exhausted' ? 'Exhausted' : 'Live'}</Badge></div></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-canvas p-3"><div><p className="text-xs font-medium text-muted">Spent</p><p className="mt-1 font-bold text-ink">{formatRupeesIndian(campaign.spent)}</p></div><div><p className="text-xs font-medium text-muted">Remaining</p><p className="mt-1 font-bold text-ink">{formatRupeesIndian(campaign.remainingBudget)}</p></div></div><Progress value={campaign.totalBudget ? (campaign.spent / campaign.totalBudget) * 100 : 0} label={`${formatRupeesIndian(campaign.spent)} of ${formatRupeesIndian(campaign.totalBudget)} used`} /><div className="border-t border-line pt-4"><p className="mb-2 text-xs font-bold tracking-wide text-muted">PAYOUT LADDER</p><div className="flex flex-wrap gap-2">{campaign.milestones.map((milestone) => <span key={milestone.threshold} className="rounded-lg bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">{milestone.threshold.toLocaleString('en-IN')} views · {formatRupeesIndian(milestone.payout)}</span>)}</div></div></Card>)}</div>;
}

function CampaignRow({ campaign }: { campaign: Campaign }) { return <div className="rounded-xl border border-line p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-bold text-ink">{campaign.name}</p><p className="mt-1 text-xs text-muted">{campaign.platform}</p></div><p className="text-sm font-bold text-ink">{formatRupeesIndian(campaign.remainingBudget)} left</p></div><Progress className="mt-3" value={campaign.totalBudget ? campaign.spent / campaign.totalBudget * 100 : 0} /></div>; }

function BrandSkeleton() { return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36" />)}</div><Skeleton className="h-72" /></div>; }
