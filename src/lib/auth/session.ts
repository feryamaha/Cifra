import { jsonNoStore } from '@/lib/security/http-headers';
import { auth } from './auth';

/** Sessão de usuário final (nunca implica admin). */
export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user?.id) {
    return {
      user: null as null,
      error: jsonNoStore({ error: 'Faça login.' }, { status: 401 }),
    };
  }
  return { user, error: null as null };
}
