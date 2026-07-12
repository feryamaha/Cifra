/**
 * Anúncios: free = true.
 * Premium: CIFRATOM_FORCE_PREMIUM / NEXT_PUBLIC_CIFRATOM_FORCE_PREMIUM (dev)
 * ou opts.plan === 'premium' (sessão do usuário).
 * SPEC_006 D3 / SPEC_011 D5 — pagamento em spec futura.
 */
export function areAdsEnabled(opts?: { plan?: 'free' | 'premium' | null }): boolean {
  const forceServer = process.env.CIFRATOM_FORCE_PREMIUM?.trim().toLowerCase();
  const forcePublic = process.env.NEXT_PUBLIC_CIFRATOM_FORCE_PREMIUM?.trim().toLowerCase();
  const force = forceServer || forcePublic;
  if (force === '1' || force === 'true' || force === 'yes') return false;
  if (opts?.plan === 'premium') return false;
  return true;
}
