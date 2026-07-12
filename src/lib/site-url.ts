/**
 * URL base canônica do site, usada por sitemap, robots e metadata (SEO).
 *
 * Ordem de resolução:
 *  1. NEXT_PUBLIC_SITE_URL ou AUTH_URL: domínio explícito (produção/custom).
 *  2. VERCEL_PROJECT_PRODUCTION_URL: domínio de produção do projeto Vercel
 *     (ex.: cifra-tomr.vercel.app), setado automaticamente pela Vercel.
 *  3. VERCEL_URL: URL do deploy atual (previews).
 *  4. localhost:3000 (dev).
 *
 * Assim o SEO funciona no deploy da Vercel SEM hardcode; quando o Fernando
 * apontar o domínio oficial (Hostinger/HostGator), basta setar
 * NEXT_PUBLIC_SITE_URL nas variáveis de ambiente.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd.replace(/\/$/, '')}`;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}
