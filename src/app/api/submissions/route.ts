/**
 * Endpoint LEGADO desativado (SECURITY_SCAN 003 E1).
 * Envio de cifras: POST /api/versions (autenticado, pending_review no Postgres).
 */

export async function POST(): Promise<Response> {
  return Response.json(
    {
      error: 'Endpoint desativado. Use o fluxo autenticado de envio de cifras.',
    },
    {
      status: 410,
      headers: { Allow: '' },
    },
  );
}

export async function GET(): Promise<Response> {
  return Response.json({ error: 'Não encontrado.' }, { status: 404 });
}
