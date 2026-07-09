export type BadgeVariant =
  | 'amber'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'number';

export interface BadgeProps {
  variant?: BadgeVariant;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}
