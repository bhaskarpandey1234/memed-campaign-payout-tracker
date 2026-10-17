'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, Eye, EyeOff, LoaderCircle, X } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

const buttonStyles = cva(
  'focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-55 disabled:shadow-none',
  { variants: {
    variant: {
      primary: 'bg-primary text-white shadow-sm hover:bg-primary-hover',
      secondary: 'border border-line-strong bg-surface-raised text-ink hover:bg-canvas',
      ghost: 'text-muted hover:bg-primary-soft hover:text-primary',
      danger: 'bg-danger text-white hover:bg-[#a42f3e]',
    },
    size: { sm: 'min-h-9 px-3 text-sm', md: 'min-h-11 px-4 text-sm', lg: 'min-h-12 px-5 text-base' },
  }, defaultVariants: { variant: 'primary', size: 'md' },
});

export type ButtonProps = ComponentPropsWithoutRef<'button'> & VariantProps<typeof buttonStyles> & {
  loading?: boolean;
  loadingLabel?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, loadingLabel, children, disabled, ...props }, ref,
) {
  return <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} disabled={disabled || loading} {...props}>
    {loading && <Spinner className="size-4" />}<span className="inline-flex items-center justify-center gap-2 whitespace-nowrap">{loading ? (loadingLabel || children) : children}</span>
  </button>;
});

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-hidden="true" className={cn('size-5 animate-spin', className)} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6', className)}>{children}</section>;
}

const badgeStyles = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide', {
  variants: { tone: {
    neutral: 'bg-canvas-deep text-muted', primary: 'bg-primary-soft text-primary', success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning', danger: 'bg-danger-soft text-danger',
  } }, defaultVariants: { tone: 'neutral' },
});

export function Badge({ children, tone, className }: { children: ReactNode; tone?: VariantProps<typeof badgeStyles>['tone']; className?: string }) {
  return <span className={cn(badgeStyles({ tone }), className)}>{children}</span>;
}

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'> & { hasError?: boolean; prefix?: ReactNode }>(function Input(
  { className, hasError, prefix, ...props }, ref,
) {
  return <div className="relative">
    {prefix && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">{prefix}</span>}
    <input ref={ref} className={cn(
      'focus-ring min-h-11 w-full rounded-xl border bg-surface-raised px-3 text-sm text-ink placeholder:text-subtle transition-colors',
      prefix && 'pl-8', hasError ? 'border-danger bg-danger-soft/30' : 'border-line-strong hover:border-muted focus:border-primary', className,
    )} {...props} />
  </div>;
});

export const PasswordInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'> & { hasError?: boolean }>(function PasswordInput(
  { className, hasError, ...props }, ref,
) {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><Input ref={ref} type={visible ? 'text' : 'password'} hasError={hasError} className={cn('pr-11', className)} {...props} />
    <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((state) => !state)} className="focus-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted hover:text-ink">
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button></div>;
});

export function Field({ label, hint, error, required, children, className }: {
  label: string; hint?: string; error?: string; required?: boolean; children: ReactNode; className?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return <div className={cn('space-y-1.5', className)}>
    <div className="flex items-baseline justify-between gap-3"><label className="text-sm font-semibold text-ink">{label}{required && <span className="ml-1 text-danger">*</span>}</label>{hint && <span className="text-xs text-muted">{hint}</span>}</div>
    {children}
    {error && <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">{error}</p>}
  </div>;
}

export function Select({ value, onValueChange, options, placeholder = 'Select an option', ariaLabel }: {
  value?: string; onValueChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string; ariaLabel: string;
}) {
  return <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
    <SelectPrimitive.Trigger aria-label={ariaLabel} className="focus-ring flex min-h-11 w-full items-center justify-between rounded-xl border border-line-strong bg-surface-raised px-3 text-sm font-medium text-ink hover:border-muted data-[placeholder]:text-subtle">
      <SelectPrimitive.Value placeholder={placeholder} /><SelectPrimitive.Icon><ChevronDown className="size-4 text-muted" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal><SelectPrimitive.Content position="popper" className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line bg-surface-raised p-1 shadow-float">
      <SelectPrimitive.Viewport>{options.map((option) => <SelectPrimitive.Item key={option.value} value={option.value} className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-ink outline-none data-[highlighted]:bg-primary-soft data-[state=checked]:font-bold">
        <SelectPrimitive.ItemIndicator className="absolute left-2"><Check className="size-4 text-primary" /></SelectPrimitive.ItemIndicator><SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>)}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content></SelectPrimitive.Portal>
  </SelectPrimitive.Root>;
}

export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const normalized = Math.max(0, Math.min(100, value));
  return <div className={cn('space-y-1.5', className)}>{label && <div className="flex justify-between text-xs text-muted"><span>{label}</span><span>{Math.round(normalized)}%</span></div>}<div className="h-2 overflow-hidden rounded-full bg-canvas-deep" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized}><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${normalized}%` }} /></div></div>;
}

export function StatCard({ label, value, detail, accent = 'primary' }: { label: string; value: ReactNode; detail?: ReactNode; accent?: 'primary' | 'accent' | 'success' }) {
  const colors = { primary: 'bg-primary-soft text-primary', accent: 'bg-[#ffe4dd] text-accent', success: 'bg-success-soft text-success' };
  return <Card className="relative overflow-hidden"><div className={cn('absolute right-0 top-0 h-1.5 w-24 rounded-bl-full', colors[accent])} /><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{value}</p>{detail && <div className="mt-2 text-xs text-muted">{detail}</div>}</Card>;
}

export function Skeleton({ className }: { className?: string }) { return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-canvas-deep', className)} />; }

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <Card className="flex min-h-56 flex-col items-center justify-center border-dashed text-center"><div className="mb-3 rounded-2xl bg-primary-soft p-3 text-primary">{icon}</div><h3 className="font-bold text-ink">{title}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-muted">{description}</p>{action && <div className="mt-4">{action}</div>}</Card>;
}

export function ErrorState({ title = 'We could not load this yet', message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return <Card className="border-danger/30 bg-danger-soft/30"><h3 className="font-bold text-danger">{title}</h3><p className="mt-1 text-sm text-muted">{message}</p>{onRetry && <Button className="mt-4" variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}</Card>;
}

export function InlineAlert({ tone = 'success', children }: { tone?: 'success' | 'warning' | 'danger'; children: ReactNode }) {
  const colors = { success: 'border-success/20 bg-success-soft text-success', warning: 'border-warning/20 bg-warning-soft text-warning', danger: 'border-danger/20 bg-danger-soft text-danger' };
  return <div role="status" className={cn('rounded-xl border px-3 py-2.5 text-sm font-medium', colors[tone])}>{children}</div>;
}

export function Dialog({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}><DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#201d2b]/35 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogPrimitive.Content className="focus-ring fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface-raised p-5 shadow-float sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><DialogPrimitive.Title className="text-lg font-bold text-ink">{title}</DialogPrimitive.Title>{description && <DialogPrimitive.Description className="mt-1 text-sm text-muted">{description}</DialogPrimitive.Description>}</div><DialogPrimitive.Close asChild><button aria-label="Close dialog" className="focus-ring rounded-lg p-1 text-muted hover:bg-canvas hover:text-ink"><X className="size-5" /></button></DialogPrimitive.Close></div><div className="mt-5">{children}</div>
    </DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>;
}

export function AccountMenu({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return <DropdownMenu.Root><DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-44 rounded-xl border border-line bg-surface-raised p-1 shadow-float">{children}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>;
}

export function AccountMenuItem({ children, onSelect, destructive }: { children: ReactNode; onSelect: () => void; destructive?: boolean }) {
  return <DropdownMenu.Item onSelect={onSelect} className={cn('focus-ring flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none data-[highlighted]:bg-canvas', destructive && 'text-danger data-[highlighted]:bg-danger-soft')}>{children}</DropdownMenu.Item>;
}
