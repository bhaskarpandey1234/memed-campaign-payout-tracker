'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BriefcaseBusiness, CircleDollarSign, Sparkles, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Field, InlineAlert, Input, PasswordInput } from '@/components/ui';
import { login, signup } from '../api/auth.api';
import { getAuthSchema, type AuthFormValues } from '../schemas/auth.schema';
import type { Role, User } from '../types';

type Mode = 'login' | 'signup';

const roleCopy: Record<Role, { title: string; description: string; icon: typeof BriefcaseBusiness }> = {
  brand: { title: 'I represent a brand', description: 'Launch campaigns and keep budgets transparent.', icon: BriefcaseBusiness },
  creator: { title: 'I create content', description: 'Find opportunities and track every payout.', icon: UsersRound },
};

export function AuthScreen({ onUser }: { onUser: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [requestError, setRequestError] = useState('');
  const schema = useMemo(() => getAuthSchema(mode), [mode]);
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', role: 'creator' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => { form.clearErrors(); setRequestError(''); }, [mode, form]);

  function switchMode(nextMode: Mode) {
    // A sign-up form must always start from a clean slate. This also prevents
    // credentials entered for sign-in from carrying over when the user switches modes.
    form.reset({ email: '', password: '', role: 'creator' });
    setRequestError('');
    setMode(nextMode);
  }

  async function submit(values: AuthFormValues) {
    setRequestError('');
    try {
      const response = mode === 'login'
        ? await login({ email: values.email.trim(), password: values.password })
        : await signup({ email: values.email.trim(), password: values.password, role: values.role });
      toast.success(mode === 'login' ? 'Welcome back.' : 'Your workspace is ready.');
      onUser(response.user);
    } catch (error) {
      setRequestError((error as Error).message);
    }
  }

  const role = form.watch('role');
  return <main className="app-grid flex min-h-[100dvh] items-center bg-canvas p-3 sm:p-5 lg:p-6">
    <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-line bg-surface shadow-float sm:min-h-[calc(100dvh-2.5rem)] lg:min-h-[calc(100dvh-3rem)] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-[#28203c] p-10 text-white lg:flex lg:flex-col">
        <div className="absolute -right-16 -top-20 size-72 rounded-full bg-primary/45 blur-3xl" /><div className="absolute -bottom-28 -left-14 size-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative flex items-center gap-2 text-lg font-bold"><span className="grid size-9 place-items-center rounded-xl bg-white text-primary"><CircleDollarSign className="size-5" /></span>Meme&apos;d</div>
        <div className="relative my-auto max-w-md"><p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-white/85"><Sparkles className="size-3.5" />CREATOR COMMERCE, CLARIFIED</p><h1 className="display-font text-5xl font-semibold leading-[1.02]">Every campaign. Every milestone. <span className="text-[#d9caff]">One clear payout story.</span></h1><p className="mt-6 max-w-sm text-base leading-7 text-white/70">A calmer way for brands and creators to turn great content into accountable earnings.</p></div>
        <div className="relative grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/12 bg-white/8 p-4"><p className="text-2xl font-bold">₹</p><p className="mt-1 text-sm text-white/70">Milestone-based payouts</p></div><div className="rounded-2xl border border-white/12 bg-white/8 p-4"><p className="text-2xl font-bold">∞</p><p className="mt-1 text-sm text-white/70">Clarity at every view count</p></div></div>
      </section>
      <section className="flex min-h-full flex-col p-6 sm:p-10 lg:p-12"><div className="flex items-center gap-2 text-lg font-bold text-ink lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-primary text-white"><CircleDollarSign className="size-5" /></span>Meme&apos;d</div>
        <div className="my-auto py-8"><p className="text-sm font-bold tracking-wide text-primary">{mode === 'login' ? 'WELCOME BACK' : 'JOIN MEME’D'}</p><h2 className="display-font mt-2 text-4xl font-semibold text-ink">{mode === 'login' ? 'Pick up where your campaigns left off.' : 'Make your next post count.'}</h2><p className="mt-3 text-sm leading-6 text-muted">{mode === 'login' ? 'Sign in to your payout workspace.' : 'Choose your workspace, then create your account.'}</p>
          <form className="mt-7 space-y-4" onSubmit={form.handleSubmit(submit)} autoComplete={mode === 'signup' ? 'off' : 'on'} noValidate>
            {mode === 'signup' && <div className="grid gap-2 sm:grid-cols-2">{(['creator', 'brand'] as Role[]).map((option) => { const content = roleCopy[option]; const Icon = content.icon; return <button key={option} type="button" onClick={() => form.setValue('role', option, { shouldValidate: true })} className={`focus-ring rounded-2xl border p-3 text-left transition-colors ${role === option ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong hover:bg-canvas'}`}><Icon className={`size-5 ${role === option ? 'text-primary' : 'text-muted'}`} /><p className="mt-3 text-sm font-bold text-ink">{content.title}</p><p className="mt-1 text-xs leading-5 text-muted">{content.description}</p></button>; })}</div>}
            <Field label="Email address" error={form.formState.errors.email?.message} required><Input type="email" autoComplete={mode === 'signup' ? 'off' : 'email'} placeholder="you@example.com" hasError={Boolean(form.formState.errors.email)} {...form.register('email')} /></Field>
            <Field label="Password" hint={mode === 'signup' ? '6+ characters' : undefined} error={form.formState.errors.password?.message} required><PasswordInput autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Enter your password" hasError={Boolean(form.formState.errors.password)} {...form.register('password')} /></Field>
            {requestError && <InlineAlert tone="danger">{requestError}</InlineAlert>}
            <Button type="submit" size="lg" className="w-full" loading={form.formState.isSubmitting} loadingLabel={mode === 'login' ? 'Signing in…' : 'Creating account…'}>{mode === 'login' ? <>Sign in <ArrowRight className="size-4" /></> : 'Create my account'}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">{mode === 'login' ? 'New to Meme’d?' : 'Already have an account?'} <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="focus-ring rounded font-bold text-primary hover:text-primary-hover">{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        </div>
      </section>
    </div>
  </main>;
}
