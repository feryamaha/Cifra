/**
 * Acesso ADMIN: apenas cookie HMAC de /admin/login (senha de ambiente).
 * Conta Auth.js de usuário NUNCA autoriza rotas admin.
 */

import { cookies } from 'next/headers';
import { jsonNoStore } from '@/lib/security/http-headers';
import { ADMIN_COOKIE, verifySessionToken } from './admin-auth';

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);
}

export function unauthorized(): Response {
  return jsonNoStore({ error: 'Não autorizado.' }, { status: 401 });
}
