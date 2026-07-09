export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}
