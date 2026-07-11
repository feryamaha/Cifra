import footerRaw from '@/data/ads/footer-carousel.json';
import heroRaw from '@/data/ads/partner-outdoor.json';
import type {
  FooterCarouselConfig,
  PartnerOutdoorConfig,
  PartnerOutdoorSlide,
} from '@/types/ads/partner-outdoor.types';

/** Capacidade máxima do outdoor da home (regra de produto). */
export const MAX_PARTNER_OUTDOOR_SLIDES = 10;

/** Slides por card no footer. */
export const MAX_FOOTER_SLIDES_PER_CARD = 5;

/** Cards lado a lado no footer (3 × 5 = 15 ads). */
export const FOOTER_CAROUSEL_COLUMNS = 3;

const MIN_INTERVAL_MS = 2000;
const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_COPYRIGHT = '© Cifra Tom';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseSlide(value: unknown, index: number): PartnerOutdoorSlide | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;

  const id = isNonEmptyString(row.id) ? row.id.trim() : `slide-${index + 1}`;
  const image = isNonEmptyString(row.image) ? row.image.trim() : null;
  const text = isNonEmptyString(row.text) ? row.text.trim() : null;
  const href = isNonEmptyString(row.href) ? row.href.trim() : null;

  if (!image || !text || !href) return null;

  return { id, image, text, href };
}

function parseIntervalMs(value: unknown): number {
  const intervalRaw =
    typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : DEFAULT_INTERVAL_MS;
  return Math.max(MIN_INTERVAL_MS, intervalRaw);
}

function parseCopyright(value: unknown): string {
  return isNonEmptyString(value) ? value.trim() : DEFAULT_COPYRIGHT;
}

function parseSlides(value: unknown, maxSlides: number): PartnerOutdoorSlide[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseSlide)
    .filter((slide): slide is PartnerOutdoorSlide => slide !== null)
    .slice(0, maxSlides);
}

function parseOutdoorConfig(
  source: Partial<PartnerOutdoorConfig> & { slides?: unknown },
  maxSlides: number,
): PartnerOutdoorConfig {
  return {
    copyright: parseCopyright(source.copyright),
    intervalMs: parseIntervalMs(source.intervalMs),
    slides: parseSlides(source.slides, maxSlides),
  };
}

/**
 * Outdoor de parceiros da home (hero).
 * - descarta slides inválidos
 * - limita a {@link MAX_PARTNER_OUTDOOR_SLIDES}
 * - garante interval mínimo
 */
export function getPartnerOutdoor(): PartnerOutdoorConfig {
  return parseOutdoorConfig(
    heroRaw as Partial<PartnerOutdoorConfig> & { slides?: unknown },
    MAX_PARTNER_OUTDOOR_SLIDES,
  );
}

/**
 * Footer: 3 cards em linha, cada um com carousel de até 5 slides (15 ads).
 * Mesmo componente da home; autoplay infinito (intervalMs, default 5s).
 */
export function getFooterCarousel(): FooterCarouselConfig {
  const source = footerRaw as {
    copyright?: unknown;
    intervalMs?: unknown;
    columns?: unknown;
  };

  const copyright = parseCopyright(source.copyright);
  const intervalMs = parseIntervalMs(source.intervalMs);

  const rawColumns = Array.isArray(source.columns) ? source.columns : [];
  const columns = rawColumns
    .slice(0, FOOTER_CAROUSEL_COLUMNS)
    .map((col, index) => {
      if (!col || typeof col !== 'object') return null;
      const row = col as { id?: unknown; slides?: unknown };
      const id = isNonEmptyString(row.id) ? row.id.trim() : `col-${index + 1}`;
      const slides = parseSlides(row.slides, MAX_FOOTER_SLIDES_PER_CARD);
      if (slides.length === 0) return null;
      return {
        id,
        config: { copyright, intervalMs, slides },
      };
    })
    .filter((col): col is NonNullable<typeof col> => col !== null);

  return { columns };
}
