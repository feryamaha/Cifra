/**
 * Auth de USUÁRIO FINAL (Auth.js).
 * Não concede privilégios de admin. Admin é sistema separado (cookie + /admin).
 */

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { db } from '@/lib/db';
import { accounts, sessions, users, verificationTokens } from '@/lib/db/schema';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { verifyPassword } from './password';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

/** Hash bcrypt válido só para equalizar tempo quando o e-mail não existe. */
const TIMING_PAD_HASH = '$2b$12$CjL1VIRR8SSTwnTS0nmtneV3JcoOX5J3nABR3tqTmqD9WwZcLmKLO';

const providers: Provider[] = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'E-mail', type: 'email' },
      password: { label: 'Senha', type: 'password' },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const email = parsed.data.email.trim().toLowerCase();

      const limited = await rateLimitCheck(`login-email:${email}`, {
        limit: 10,
        windowMs: 15 * 60 * 1000,
      });
      if (!limited.ok) return null;

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const hash = user?.passwordHash ?? TIMING_PAD_HASH;
      const ok = await verifyPassword(parsed.data.password, hash);
      if (!user?.passwordHash || !ok) return null;
      if (user.blocked || user.deletedAt) return null;

      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

      // Conta de usuário final — NUNCA eleva a admin aqui
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: 'user' as const,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

const isProd = process.env.NODE_ENV === 'production';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/entrar',
    error: '/entrar',
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? token.email;
      }
      // Sessão de usuário final: role sempre "user" (admin é outro login)
      token.role = 'user';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? '';
        session.user.role = 'user';
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: isProd ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },
  // Só confia no host do request se AUTH_TRUST_HOST=true (prod atrás de edge)
  // ou em non-production. Evita trustHost cego em produção mal configurada.
  trustHost: process.env.AUTH_TRUST_HOST === 'true' || process.env.NODE_ENV !== 'production',
  secret: process.env.AUTH_SECRET,
  logger: {
    error(error) {
      console.error('[auth]', error.name);
    },
    warn(code) {
      if (process.env.NODE_ENV !== 'production') console.warn('[auth]', code);
    },
    debug() {},
  },
});
