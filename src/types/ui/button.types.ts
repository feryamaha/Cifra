export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'default';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}
