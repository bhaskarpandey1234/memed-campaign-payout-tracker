'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TrendingUp } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Dialog, Field, Input, InlineAlert } from '@/components/ui';
import { formatRupeesIndian } from '@/lib/format/currency';
import { viewCountSchema } from '../schemas/submission.schema';
import type { Submission } from '../types';

export function ViewUpdateDialog({ submission, onClose, onSave, saving, requestError }: { submission: Submission | null; onClose: () => void; onSave: (views: number) => Promise<void>; saving: boolean; requestError?: string }) {
  const schema = useMemo(() => viewCountSchema(submission?.views || 0), [submission?.views]);
  const form = useForm<{ views: string }>({ resolver: zodResolver(schema), defaultValues: { views: submission?.views.toString() || '' }, mode: 'onBlur', reValidateMode: 'onChange' });
  useEffect(() => { form.reset({ views: submission?.views.toString() || '' }); }, [submission, form]);
  if (!submission) return null;
  const campaign = typeof submission.campaign === 'string' ? null : submission.campaign;
  return <Dialog open={Boolean(submission)} onOpenChange={(open) => !open && !saving && onClose()} title="Simulate new views" description="This mirrors the platform update used to calculate the highest eligible payout.">
    <form className="space-y-5" onSubmit={form.handleSubmit(async (values) => { await onSave(Number(values.views)); })} noValidate>
      <div className="rounded-xl bg-canvas p-4"><p className="truncate text-sm font-bold text-ink">{campaign?.name || 'Campaign submission'}</p><p className="mt-1 truncate text-xs text-muted">{submission.postUrl}</p><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs text-muted">Current views</p><p className="mt-1 font-bold text-ink">{submission.views.toLocaleString('en-IN')}</p></div><div><p className="text-xs text-muted">Credited so far</p><p className="mt-1 font-bold text-success">{formatRupeesIndian(submission.creditedPayout)}</p></div></div></div>
      <Field label="New total views" hint="Whole number" required error={form.formState.errors.views?.message}><Input inputMode="numeric" hasError={Boolean(form.formState.errors.views)} {...form.register('views')} /></Field>
      <div className="flex gap-2 rounded-xl border border-primary/15 bg-primary-soft/60 p-3 text-sm text-primary"><TrendingUp className="mt-0.5 size-4 shrink-0" /><p>Payouts are calculated from the highest campaign milestone crossed. Repeating the same view count never pays twice.</p></div>
      {requestError && <InlineAlert tone="danger">{requestError}</InlineAlert>}
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" loading={saving} loadingLabel="Updating views…">Update views</Button></div>
    </form>
  </Dialog>;
}
