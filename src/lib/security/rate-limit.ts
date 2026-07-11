/**
 * Rate limit:
 *  - Preferência: Postgres (`rate_buckets`) — multi-instância / serverless.
 *  - Fallback: memória (single-instance / DB indisponível).
 * Nunca expõe detalhes internos ao cliente.
 */

import { eq, sql } from 'drizzle-orm';

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

/** Fallback single-process (sync). */
export function rateLimit(key: string, opts: { limit: number; windowMs: number }): RateLimitResult {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (bucket.count >= opts.limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Limpa buckets de memória expirados. */
export function pruneRateLimits(): void {
  const now = Date.now();
  for (const [k, b] of memoryBuckets) {
    if (b.resetAt <= now) memoryBuckets.delete(k);
  }
}

async function rateLimitDb(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  // import dinâmico evita hard-fail se schema/db não carregarem em edge hipotético
  const { db } = await import('@/lib/db');
  const { rateBuckets } = await import('@/lib/db/schema');

  const now = Date.now();
  const resetAt = new Date(now + opts.windowMs);
  const keySafe = key.slice(0, 191);

  const [existing] = await db
    .select()
    .from(rateBuckets)
    .where(eq(rateBuckets.key, keySafe))
    .limit(1);

  if (!existing || existing.resetAt.getTime() <= now) {
    await db
      .insert(rateBuckets)
      .values({ key: keySafe, count: 1, resetAt })
      .onConflictDoUpdate({
        target: rateBuckets.key,
        set: { count: 1, resetAt },
      });
    return { ok: true };
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt.getTime() - now) / 1000)),
    };
  }

  await db
    .update(rateBuckets)
    .set({ count: sql`${rateBuckets.count} + 1` })
    .where(eq(rateBuckets.key, keySafe));

  return { ok: true };
}

/**
 * Rate limit durable quando DATABASE_URL existe; senão memória.
 * Usar em todas as rotas sensíveis (auth, submit, admin).
 */
export async function rateLimitCheck(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  pruneRateLimits();

  if (process.env.DATABASE_URL) {
    try {
      return await rateLimitDb(key, opts);
    } catch {
      // tabela ausente / rede: não derruba a API; cai para memória
    }
  }

  return rateLimit(key, opts);
}

export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = (fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown').slice(0, 64);
  return `${scope}:${ip}`;
}

export const RATE = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  submit: { limit: 20, windowMs: 60 * 60 * 1000 },
  forgot: { limit: 5, windowMs: 60 * 60 * 1000 },
  adminLogin: { limit: 8, windowMs: 15 * 60 * 1000 },
} as const;
