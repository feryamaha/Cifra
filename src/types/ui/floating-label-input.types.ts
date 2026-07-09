export interface FloatingLabelInputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  inputClassName?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  disableLabelFloat?: boolean;
  placeholder?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  maxLength?: number;
  readOnly?: boolean;
  disabled?: boolean;
  onlyLetters?: boolean;
  onlyNumbers?: boolean;
  allowAllCharacters?: boolean;
  mask?: string;
  error?: string | null;
  name?: string;
}
