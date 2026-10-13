import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? '' : variant;
  const classes = [variantClass, className].filter(Boolean).join(' ');
  return <button {...props} className={classes || undefined} />;
}
