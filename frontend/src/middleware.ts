import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const token = request.cookies.get('jwt')?.value
  console.log("middleware token", token);

  if (!token) {
    console.log("middleware token not found");
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch user data')
    }
    // console.log("middleware res", res.body);
    const userData = await res.json()
    console.log("middleware userData", userData);

    // ユーザーデータをリクエストヘッダーに追加
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-data', JSON.stringify(userData))

    // アドミンページへのアクセス制限
    if (request.nextUrl.pathname.startsWith('/admin') && !userData.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Error in middleware:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*'],
}
