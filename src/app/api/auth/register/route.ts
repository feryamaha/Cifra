import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { validatePasswordStrength } from '@/lib/security/password-policy';
import { clientKey, RATE, rateLimitCheck } from '@/lib/security/rate-limit';

const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email().max(160),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request): Promise<Response> {
  const limited = await rateLimitCheck(clientKey(req, 'register'), RATE.register);
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
    return Response.json({ error: 'Não foi possível processar o pedido.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: 'Dados inválidos. Use e-mail válido e senha com pelo menos 8 caracteres.' },
      { status: 400 },
    );
  }

  const strength = validatePasswordStrength(parsed.data.password);
  if (!strength.ok) {
    return Response.json({ error: strength.error }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Anti-enumeração: mesma mensagem e mesmo status se e-mail já existe
  // (hash dummy se existir para aproximar tempo de resposta)
  if (existing) {
    await hashPassword(parsed.data.password);
    return Response.json({
      ok: true,
      message: 'Se os dados forem válidos, a conta estará disponível para login.',
    });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.insert(users).values({
    email,
    name: parsed.data.name.trim(),
    passwordHash,
    role: 'user',
  });

  // não devolve id/email; status 200 uniforme (anti-enum)
  return Response.json({
    ok: true,
    message: 'Se os dados forem válidos, a conta estará disponível para login.',
  });
}
