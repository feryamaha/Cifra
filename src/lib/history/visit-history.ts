export interface VisitEntry {
  slug: string;
  title: string;
  artist: string;
  visitedAt: string;
}

const KEY = 'cifratom.visit-history.v1';
const MAX = 50;
const MAX_PREMIUM = 200;

export function loadVisitHistory(): VisitEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is VisitEntry =>
          Boolean(e) &&
          typeof e === 'object' &&
          typeof (e as VisitEntry).slug === 'string' &&
          typeof (e as VisitEntry).title === 'string',
      )
      .slice(0, MAX_PREMIUM);
  } catch {
    return [];
  }
}

export function recordVisit(
  entry: Omit<VisitEntry, 'visitedAt'>,
  opts?: { premium?: boolean },
): void {
  if (typeof window === 'undefined') return;
  try {
    const max = opts?.premium ? MAX_PREMIUM : MAX;
    const list = loadVisitHistory().filter((e) => e.slug !== entry.slug);
    list.unshift({ ...entry, visitedAt: new Date().toISOString() });
    sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, max)));
  } catch {
    /* quota */
  }
}

export function clearVisitHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
