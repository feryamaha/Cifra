/**
 * Anúncios: free = true.
 * Premium: CIFRATOM_FORCE_PREMIUM=1 (dev) ou users.plan === premium (quando session disponível).
 * SPEC_006 D3 — pagamento em spec futura.
 */
export function areAdsEnabled(opts?: { plan?: 'free' | 'premium' | null }): boolean {
  const force = process.env.CIFRATOM_FORCE_PREMIUM?.trim().toLowerCase();
  if (force === '1' || force === 'true' || force === 'yes') return false;
  if (opts?.plan === 'premium') return false;
  return true;
}
