import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ApiService } from './services/apiService'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const userData = await ApiService.me(token);
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
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*'],
};