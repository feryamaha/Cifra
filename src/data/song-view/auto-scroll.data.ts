import type { AutoScrollOption, AutoScrollSpeed } from '@/types/song/auto-scroll.types';

/**
 * Velocidades calibradas para tocar sem correr atrás da cifra.
 * low ≈ leitura tranquila · middle ≈ andamento médio · high ≈ música rápida.
 * (−30% sobre 20/39/67 → 14/27/47.)
 */
export const AUTO_SCROLL_OPTIONS: AutoScrollOption[] = [
  { value: 'off', label: 'Off', pxPerSecond: 0 },
  { value: 'low', label: 'Low', pxPerSecond: 14 },
  { value: 'middle', label: 'Mid', pxPerSecond: 27 },
  { value: 'high', label: 'High', pxPerSecond: 47 },
];

export const AUTO_SCROLL_SPEED_MAP: Record<AutoScrollSpeed, number> = Object.fromEntries(
  AUTO_SCROLL_OPTIONS.map((o) => [o.value, o.pxPerSecond]),
) as Record<AutoScrollSpeed, number>;
