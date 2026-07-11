import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { clientKey, RATE, rateLimitCheck } from '@/lib/security/rate-limit';

const bodySchema = z.object({
  email: z.string().email().max(160),
});

/**
 * Sempre responde 200 com a mesma mensagem (anti-enumeração).
 * Com provider de e-mail configurado no futuro, envia o link; até lá não revela se o e-mail existe.
 */
export async function POST(req: Request): Promise<Response> {
  const limited = await rateLimitCheck(clientKey(req, 'forgot'), RATE.forgot);
  if (!limited.ok) {
    return Response.json(
      { error: 'Muitas tentativas. Aguarde e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({
      ok: true,
      message:
        'Se existir uma conta com este e-mail, você receberá instruções para redefinir a senha.',
    });
  }

  const parsed = bodySchema.safeParse(json);
  // mesma resposta mesmo com e-mail inválido (não ajudar enumeração / probing)
  if (!parsed.success) {
    return Response.json({
      ok: true,
      message:
        'Se existir uma conta com este e-mail, você receberá instruções para redefinir a senha.',
    });
  }

  const email = parsed.data.email.trim().toLowerCase();
  // lookup silencioso (preparado para e-mail provider; sem log de e-mail em prod)
  await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

  return Response.json({
    ok: true,
    message:
      'Se existir uma conta com este e-mail, você receberá instruções para redefinir a senha.',
  });
}
