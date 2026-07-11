import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';

type Params = { params: Promise<{ id: string }> };

/**
 * Fila JSON legada desativada (W6).
 * Use POST /api/admin/versions/[id] para approve/reject Postgres.
 */
export async function POST(_req: Request, _ctx: Params): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();
  return jsonNoStore(
    {
      error: 'Endpoint legado desativado. Use a fila Postgres (POST /api/admin/versions/[id]).',
    },
    { status: 410 },
  );
}
