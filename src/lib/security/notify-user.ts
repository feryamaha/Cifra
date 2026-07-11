/**
 * Notificação ao usuário: sempre in-app; e-mail se RESEND_API_KEY (ou similar) existir.
 * Nunca loga corpo com secrets.
 */

import { db } from '@/lib/db';
import { userNotifications } from '@/lib/db/schema';
import { REJECTION_CATEGORY_LABELS } from '@/lib/moderation/labels';

export { REJECTION_CATEGORY_LABELS };

export async function notifyUser(opts: {
  userId: string;
  email?: string | null;
  type: string;
  title: string;
  body: string;
  versionId?: string | null;
  meta?: Record<string, string>;
}): Promise<{ inApp: boolean; emailSent: boolean }> {
  await db.insert(userNotifications).values({
    userId: opts.userId,
    type: opts.type,
    title: opts.title,
    body: opts.body,
    versionId: opts.versionId ?? null,
    meta: opts.meta ?? null,
  });

  let emailSent = false;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'Cifra Tom <noreply@cifratom.local>';

  if (apiKey && opts.email) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [opts.email],
          subject: opts.title,
          text: opts.body,
        }),
      });
      emailSent = res.ok;
      if (!res.ok) console.error('[notify-user] email provider failed', res.status);
    } catch {
      console.error('[notify-user] email provider error');
    }
  }

  return { inApp: true, emailSent };
}
