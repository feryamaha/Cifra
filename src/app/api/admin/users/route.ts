import { isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { songVersions, users } from '@/lib/db/schema';
import { jsonNoStore } from '@/lib/security/http-headers';
import { isAdminRequest, unauthorized } from '@/lib/server/require-admin';

/** Lista usuários com métricas. Nunca retorna passwordHash. */
export async function GET(): Promise<Response> {
  if (!(await isAdminRequest())) return unauthorized();

  const userRows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      blocked: users.blocked,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(users.createdAt);

  const versions = await db
    .select({
      authorId: songVersions.authorId,
      status: songVersions.status,
      revisionCount: songVersions.revisionCount,
    })
    .from(songVersions);

  const metrics = new Map<
    string,
    { sent: number; approved: number; rejected: number; revisions: number }
  >();

  for (const v of versions) {
    if (!v.authorId) continue;
    const m = metrics.get(v.authorId) ?? { sent: 0, approved: 0, rejected: 0, revisions: 0 };
    m.sent += 1;
    if (v.status === 'published') m.approved += 1;
    if (v.status === 'rejected') m.rejected += 1;
    m.revisions += v.revisionCount ?? 0;
    metrics.set(v.authorId, m);
  }

  const safe = userRows.map((r) => {
    const m = metrics.get(r.id) ?? { sent: 0, approved: 0, rejected: 0, revisions: 0 };
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      blocked: r.blocked,
      lastLoginAt: r.lastLoginAt,
      createdAt: r.createdAt,
      sentCount: m.sent,
      approvedCount: m.approved,
      rejectedCount: m.rejected,
      revisionTotal: m.revisions,
    };
  });

  return jsonNoStore({ users: safe });
}
