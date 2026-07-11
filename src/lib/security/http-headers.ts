/**
 * Headers para respostas com dados sensíveis (R32 / CWE-525).
 * Impede cache de browser, CDN e proxies intermediários.
 */

export const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

/** Response.json com no-store (APIs me/admin/versions). */
export function jsonNoStore(
  data: unknown,
  init?: { status?: number; headers?: HeadersInit },
): Response {
  const headers = new Headers(init?.headers);
  for (const [k, v] of Object.entries(NO_STORE_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v);
  }
  return Response.json(data, { status: init?.status ?? 200, headers });
}
