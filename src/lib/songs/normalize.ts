/** Normaliza artista/título para dedupe de obras. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugifyPart(value: string): string {
  const base = normalizeText(value).replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return base || 'item';
}

export function workSlug(artist: string, title: string): string {
  return `${slugifyPart(artist)}-${slugifyPart(title)}`.slice(0, 120);
}

export function versionSlug(artist: string, title: string, suffix?: string): string {
  const base = workSlug(artist, title);
  const tail = suffix ? `-${slugifyPart(suffix)}` : `-${Date.now().toString(36)}`;
  return `${base}${tail}`.slice(0, 140);
}
