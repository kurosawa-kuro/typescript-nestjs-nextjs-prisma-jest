import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ApiService } from './services/apiService'
import { User } from './types/models'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value
  console.log("middleware token", token);

  if (!token) {
    console.log("middleware token not found");
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // ApiServiceのmeメソッドを使用してユーザーデータを取得
    const userData = await ApiService.me(token);

    // ユーザーデータをリクエストヘッダーに追加
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-data', JSON.stringify(userData))

    // アドミンページへのアクセス制限
    if (request.nextUrl.pathname.startsWith('/admin') && !userData.isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url))
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
