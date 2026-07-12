import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { listPublishedVersions } from '@/lib/songs/server-catalog';

/** Sitemap dinâmico (SPEC_010 D2 / SPEC_011 O2): base URL no handler, não no topo do módulo. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = getSiteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/acordes',
    '/metronomo',
    '/afinador',
    '/faq',
    '/privacidade',
    '/termos',
    '/adicionar',
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.6,
  }));

  const songs = await listPublishedVersions();
  const songRoutes: MetadataRoute.Sitemap = songs.map((s) => ({
    url: `${BASE}/musica/${s.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...songRoutes];
}
