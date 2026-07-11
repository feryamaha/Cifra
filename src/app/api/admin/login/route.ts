import { cookies } from 'next/headers';
import { z } from 'zod';
import { jsonNoStore } from '@/lib/security/http-headers';
import { clientKey, RATE, rateLimitCheck } from '@/lib/security/rate-limit';
import { sanitizePlainText } from '@/lib/security/sanitize';
import { ADMIN_COOKIE, createSessionToken, passwordMatches } from '@/lib/server/admin-auth';

const bodySchema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(128),
});

function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  let diff = ba.length ^ bb.length;
  const n = Math.max(ba.length, bb.length);
  for (let i = 0; i < n; i++) diff |= (ba[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export async function POST(req: Request): Promise<Response> {
  const limited = await rateLimitCheck(clientKey(req, 'admin-login'), RATE.adminLogin);
  if (!limited.ok) {
    return jsonNoStore(
      { error: 'Muitas tentativas. Aguarde e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } },
    );
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!secret || !expectedUser || !expectedPass) {
    console.error('[admin-login] credenciais não configuradas');
    return jsonNoStore({ error: 'Serviço indisponível.' }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Credenciais inválidas.' }, { status: 401 });
  }

  const username = sanitizePlainText(parsed.data.username, 80);
  const password = parsed.data.password;

  const userOk = timingSafeEqualStr(username, expectedUser);
  const passOk = passwordMatches(password, expectedPass);
  if (!userOk || !passOk) {
    return jsonNoStore({ error: 'Credenciais inválidas.' }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    // Admin: strict reduz CSRF cross-site (R31 hardening)
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return jsonNoStore({ ok: true });
}
