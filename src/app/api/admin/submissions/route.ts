import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';

/**
 * Fila JSON legada desativada (W6). Moderação ativa = Postgres `/api/admin/versions`.
 */
export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  return jsonNoStore({ submissions: [] });
}
