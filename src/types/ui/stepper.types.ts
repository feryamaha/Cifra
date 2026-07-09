export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  format?: (value: number) => string;
  label?: string;
  className?: string;
}
