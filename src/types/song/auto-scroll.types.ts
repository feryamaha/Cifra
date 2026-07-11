/** Velocidades da auto-rolagem da página de cifra. */
export type AutoScrollSpeed = 'off' | 'low' | 'middle' | 'high';

export interface AutoScrollOption {
  value: AutoScrollSpeed;
  label: string;
  /** Pixels por segundo (0 = parado). */
  pxPerSecond: number;
}
