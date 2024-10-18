import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ClientSideApiService } from './services/ClientSideApiService'

export async function middleware(request: NextRequest) {
  console.log('Middleware started');
  const token = request.cookies.get('jwt')?.value;
  console.log('Token:', token);

  // ログインページへのアクセスの場合は、処理をスキップ
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  try {
    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userData = await ClientSideApiService.me(token);
    console.log('User data:', userData);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-data', JSON.stringify(userData));

    if (request.nextUrl.pathname.startsWith('/admin') && !userData.isAdmin) {
      console.log('Non-admin user trying to access admin route');
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('Middleware completed successfully');
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error('Error in middleware:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
    // エラーが発生した場合、クッキーを削除してからログインページにリダイレクト
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Check if response.cookies exists before trying to delete
    if (response.cookies && typeof response.cookies.delete === 'function') {
      response.cookies.delete('jwt');
    } else {
      console.warn('Unable to delete jwt cookie: response.cookies is not available');
    }
    return response;
  }
}

export const config = {
  matcher: ['/login', '/profile/:path*', '/admin/:path*'],
};
