import { cookies } from 'next/headers';
import { jsonNoStore } from '@/lib/security/http-headers';
import { ADMIN_COOKIE } from '@/lib/server/admin-auth';

export async function POST(): Promise<Response> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return jsonNoStore({ ok: true });
}
