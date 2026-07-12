/**
 * Contato comercial (anúncios). SPEC_011 D4.
 * Com RESEND_API_KEY: envia e-mail real.
 * Sem key: responde { fallback: 'mailto' } para o client abrir mailto.
 */
import { z } from 'zod';
import { jsonNoStore } from '@/lib/security/http-headers';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { sanitizePlainText } from '@/lib/security/sanitize';

const bodySchema = z
  .object({
    nome: z.string().min(2).max(120),
    email: z.string().email().max(200),
    telefone: z.string().min(10).max(40),
    mensagem: z.string().min(5).max(2000),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  const limited = await rateLimitCheck('ads-contact', { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return jsonNoStore({ error: 'Muitas tentativas. Tente mais tarde.' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonNoStore({ error: 'JSON inválido.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonNoStore({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const nome = sanitizePlainText(parsed.data.nome, 120);
  const email = parsed.data.email.trim().toLowerCase();
  const telefone = sanitizePlainText(parsed.data.telefone, 40);
  const mensagem = sanitizePlainText(parsed.data.mensagem, 2000);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM ?? 'Cifra Tom <noreply@cifratom.local>';
  const toRaw = process.env.ADS_CONTACT_TO?.trim() || 'anuncie@cifratom.com.br';
  const toEmail = toRaw.includes('<') ? (toRaw.match(/<([^>]+)>/)?.[1] ?? toRaw) : toRaw;

  if (!apiKey) {
    return jsonNoStore({ ok: true, fallback: 'mailto' as const });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [toEmail],
        reply_to: email,
        subject: `Anúncio Cifra Tom — ${nome}`,
        text: `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\n\nMensagem:\n${mensagem}`,
      }),
    });
    if (!res.ok) {
      console.error('[ads-contact] resend failed', res.status);
      return jsonNoStore({ ok: true, fallback: 'mailto' as const });
    }
    return jsonNoStore({ ok: true, sent: true });
  } catch {
    console.error('[ads-contact] resend error');
    return jsonNoStore({ ok: true, fallback: 'mailto' as const });
  }
}
