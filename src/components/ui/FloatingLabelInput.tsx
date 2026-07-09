'use client';

import { useFloatingLabelInput } from '@/hooks/ui';
import { cn } from '@/lib/utils';
import type { FloatingLabelInputProps } from '@/types/ui/floating-label-input.types';

export function FloatingLabelInput({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
  inputClassName = '',
  inputSize = 'lg',
  disableLabelFloat = false,
  placeholder = '',
  onBlur,
  onFocus,
  maxLength,
  readOnly,
  disabled,
  onlyLetters = false,
  onlyNumbers = false,
  allowAllCharacters = false,
  mask,
  error = null,
  name,
}: FloatingLabelInputProps) {
  const {
    uncontrolledValue,
    hasValue,
    shouldShowLabel,
    errorMessage,
    hasError,
    baseProps,
    handleChange,
  } = useFloatingLabelInput({
    label,
    value,
    onChange,
    type,
    placeholder,
    onBlur,
    onFocus,
    maxLength,
    readOnly,
    disabled,
    onlyLetters,
    onlyNumbers,
    allowAllCharacters,
    mask,
    disableLabelFloat,
    error,
    name,
  });

  const sizeClass = inputSize === 'sm' ? 'h-[32px]' : inputSize === 'md' ? 'h-[36px]' : 'h-12';

  const resolvedInputClassName = cn(
    `w-full ${sizeClass} border rounded-lg px-4 pt-2 pb-2 transition-colors focus:outline-none focus:ring-1`,
    hasError
      ? 'border-primary-400 text-primary-400 ring-primary-400 focus:ring-primary-400 focus:border-primary-400'
      : 'border-stroke-200 text-neutral-900 ring-neutral-700 focus:ring-neutral-700 focus:border-neutral-700',
    readOnly ? 'cursor-default bg-secondary-900/50' : 'hover:border-neutral-700',
    inputClassName,
  );

  return (
    <div className={cn('relative', className)}>
      <input
        {...baseProps}
        value={uncontrolledValue}
        onChange={handleChange}
        className={cn(
          resolvedInputClassName,
          'focus-visible:outline-2 focus-visible:outline-primary-400 focus-visible:outline-offset-2',
        )}
      />
      <label
        className={cn(
          'pointer-events-none absolute left-4 font-normal transition-all duration-200',
          disableLabelFloat
            ? cn(
                hasValue ? 'opacity-0' : 'opacity-100',
                'top-1/2 -translate-y-1/2 text-base',
                hasError ? 'text-primary-400' : 'text-neutral-500',
              )
            : shouldShowLabel
              ? cn(
                  'top-[-10px] rounded-lg bg-secondary-900 px-2 text-sm',
                  hasError ? 'text-primary-400' : 'text-neutral-500',
                )
              : cn(
                  'top-1/2 -translate-y-1/2 text-base',
                  hasError ? 'text-primary-400' : 'text-neutral-500',
                ),
        )}
      >
        {label}
      </label>
      {hasError && errorMessage && (
        <p className="pl-2 pt-1 text-[10px] text-primary-400">{errorMessage}</p>
      )}
    </div>
  );
}
