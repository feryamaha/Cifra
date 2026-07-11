import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { db } from '@/lib/db';
import { songVersions, users, works } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  let userRow: { id: string; name: string | null; email: string } | null = null;
  let versions: {
    slug: string;
    status: string;
    workTitle: string;
    workArtist: string;
  }[] = [];

  try {
    const [u] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.name, decoded))
      .limit(1);
    userRow = u ?? null;
    if (userRow) {
      versions = await db
        .select({
          slug: songVersions.slug,
          status: songVersions.status,
          workTitle: works.title,
          workArtist: works.artist,
        })
        .from(songVersions)
        .innerJoin(works, eq(songVersions.workId, works.id))
        .where(eq(songVersions.authorId, userRow.id))
        .limit(30);
    }
  } catch {
    /* db offline */
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="font-mono text-xs uppercase text-primary-400">Contribuidor</p>
      <h1 className="mt-1 font-chakra text-3xl font-bold">{userRow?.name ?? decoded}</h1>
      {!userRow ? (
        <p className="mt-6 text-sm text-neutral-500">Perfil não encontrado ou sem contribuções.</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {versions
            .filter((v) => v.status === 'published')
            .map((v) => (
              <li key={v.slug}>
                <Link href={`/musica/${v.slug}`}>
                  <Card className="p-4 hover:border-primary-500">
                    <p className="font-semibold">
                      {v.workTitle} · {v.workArtist}
                    </p>
                    <p className="text-xs text-neutral-500">{v.slug}</p>
                  </Card>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
