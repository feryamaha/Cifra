import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';
import { getCatalog } from '@/lib/server/song-store';

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  return jsonNoStore({ songs: getCatalog({ admin: true }) });
}
