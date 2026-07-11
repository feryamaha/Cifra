/**
 * Proxy — protege /admin/* e /api/admin/*.
 * Somente cookie de sessão admin (login em /admin/login).
 * Login de usuário (Auth.js) NÃO libera o painel.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/server/admin-auth';

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  if (isLoginApi) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authorized = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);

  if (isLoginPage) {
    if (authorized) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (authorized) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Não autorizado.' },
      {
        status: 401,
        headers: {
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      },
    );
  }

  const login = new URL('/admin/login', request.url);
  login.searchParams.set('de', pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
