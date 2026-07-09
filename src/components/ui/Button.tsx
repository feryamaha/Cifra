'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ButtonProps, ButtonSize, ButtonVariant } from '@/types/ui/button.types';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-400 text-secondary-950 font-semibold hover:bg-primary-300 hover:shadow-glow disabled:bg-secondary-600 disabled:text-neutral-500 disabled:hover:shadow-none',
  secondary:
    'border border-stroke-200 bg-secondary-800 text-neutral-900 hover:border-primary-700 hover:text-primary-300 disabled:text-neutral-500 disabled:border-stroke-100 disabled:hover:border-stroke-100 disabled:hover:text-neutral-500',
  ghost:
    'text-primary-400 hover:text-primary-200 hover:bg-primary-950/50 disabled:text-neutral-500 disabled:hover:bg-transparent disabled:hover:text-neutral-500',
  danger:
    'border border-auxiliary-danger-border bg-auxiliary-danger-background text-auxiliary-danger-default hover:brightness-125 disabled:opacity-40 disabled:hover:brightness-100',
  link: 'text-primary-400 font-medium hover:underline underline-offset-4 disabled:text-neutral-500 disabled:no-underline',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-md',
  default: 'p-0',
};

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  className,
  disabled,
  type = 'button',
  onClick,
  children,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-chakra transition-all duration-200 cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-primary-400 focus-visible:outline-offset-2',
    disabled && 'cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
