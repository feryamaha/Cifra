import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';

export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  return jsonNoStore({ admin: true });
}
