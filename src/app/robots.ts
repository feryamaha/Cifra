import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

/** SPEC_010 D2 / SPEC_011 O2: libera indexação pública; bloqueia admin, APIs e conta. */
export default function robots(): MetadataRoute.Robots {
  const BASE = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/conta/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
