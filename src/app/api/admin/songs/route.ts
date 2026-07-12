import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';
import { getUnifiedCatalog } from '@/lib/songs/server-catalog';

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  return jsonNoStore({ songs: await getUnifiedCatalog({ admin: true }) });
}
