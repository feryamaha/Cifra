/**
 * Headers de segurança (OWASP Secure Headers).
 * CSP: em produção evita unsafe-eval; worker PDF self-host em /pdf.worker.min.mjs
 * (sem unpkg). style-src/script-src 'unsafe-inline' exigidos pelo Next/Tailwind
 * sem pipeline de nonces (residual de framework documentado).
 *
 * Cache-Control no-store em rotas com dados de conta/admin (R32 / CWE-525).
 */

const isProd = process.env.NODE_ENV === 'production';

// unsafe-eval apenas em desenvolvimento (HMR). Produção: nunca.
const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // microphone=(self): o afinador (/afinador) usa getUserMedia na própria
  // origem (SPEC_007 C1.2). microphone=() bloqueava o prompt do browser.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=(), browsing-topics=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

/** R32: dados de sessão / CRM / envios não podem ir para cache compartilhado. */
const noStoreHeaders = [
  { key: 'Cache-Control', value: 'private, no-store, no-cache, must-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // APIs autenticadas / sensíveis
      { source: '/api/me/:path*', headers: noStoreHeaders },
      { source: '/api/admin/:path*', headers: noStoreHeaders },
      { source: '/api/versions', headers: noStoreHeaders },
      { source: '/api/versions/:path*', headers: noStoreHeaders },
      // Páginas de conta e painel admin
      { source: '/conta', headers: noStoreHeaders },
      { source: '/conta/:path*', headers: noStoreHeaders },
      { source: '/admin', headers: noStoreHeaders },
      { source: '/admin/:path*', headers: noStoreHeaders },
      { source: '/adicionar', headers: noStoreHeaders },
      { source: '/adicionar/:path*', headers: noStoreHeaders },
    ];
  },
};

export default nextConfig;
