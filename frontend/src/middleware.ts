import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ClientSideApiService } from './services/clientApiService'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;

  // ログインページへのアクセスの場合は、処理をスキップ
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const userData = await ClientSideApiService.me(token);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-data', JSON.stringify(userData));

    if (request.nextUrl.pathname.startsWith('/admin') && !userData.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error('Error in middleware:', error);
    // エラーが発生した場合、クッキーを削除してからログインページにリダイレクト
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('jwt');
    return response;
  }
}

export const config = {
  matcher: ['/login', '/profile/:path*', '/admin/:path*'],
};
