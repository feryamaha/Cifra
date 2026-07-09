'use client';

import { useMemo, useState } from 'react';

function applyMask(value: string, mask: string): string {
  if (!mask) return value;
  const maskChars = mask.split('');
  const valueChars = value.replace(/\D/g, '').split('');
  let result = '';
  let vi = 0;
  for (const mc of maskChars) {
    if (mc === '#') {
      if (vi < valueChars.length) {
        result += valueChars[vi];
        vi++;
      } else {
        break;
      }
    } else {
      if (vi < valueChars.length) {
        result += mc;
      }
    }
  }
  return result;
}

export function useFloatingLabelInput(params: {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  placeholder: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
  readOnly?: boolean;
  disabled?: boolean;
  onlyLetters: boolean;
  onlyNumbers: boolean;
  allowAllCharacters: boolean;
  mask?: string;
  disableLabelFloat?: boolean;
  error?: string | null;
  name?: string;
}) {
  const {
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
    disableLabelFloat = false,
    error = null,
    name,
  } = params;

  const [isFocused, setIsFocused] = useState(false);
  const [localHasValue, setLocalHasValue] = useState(false);

  const applyMaskFn = useMemo(() => {
    return (val: string): string => applyMask(val, mask || '');
  }, [mask]);

  const currentValue = value ?? '';
  const hasValue = currentValue.length > 0 || localHasValue;
  const shouldShowLabel = isFocused || hasValue;

  const uncontrolledValue = value !== undefined ? (mask ? applyMaskFn(value) : value) : undefined;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    setIsFocused(false);
    setLocalHasValue(e.target.value.length > 0);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    let val = e.target.value;
    if (mask) {
      val = applyMaskFn(val);
      e.target.value = val;
    }
    let isValid = true;
    if (!allowAllCharacters) {
      if (onlyLetters) {
        isValid = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(val);
      } else if (onlyNumbers) {
        isValid = /^[0-9]*$/.test(val.replace(/\D/g, ''));
      }
      if (!isValid) return;
    }
    setLocalHasValue(val.length > 0);
    if (onChange) onChange(e);
  };

  let inputType = type;
  if (onlyNumbers && type === 'text') {
    inputType = 'tel';
  }

  const baseProps = {
    type: inputType,
    name,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder: disableLabelFloat ? placeholder : isFocused ? placeholder : '',
    maxLength,
    readOnly,
    disabled,
  };

  return {
    currentValue,
    uncontrolledValue,
    hasValue,
    shouldShowLabel,
    errorMessage: error,
    hasError: !disabled && !!error,
    baseProps,
    handleChange,
  };
}
