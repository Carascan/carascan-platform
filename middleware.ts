import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = process.env.ADMIN_TOKEN

    // Token from URL ?token=xxxx
    const urlToken = request.nextUrl.searchParams.get('token')

    // Token from cookie
    const cookieToken = request.cookies.get('admin_token')?.value

    // If URL token matches, set cookie and allow access
    if (urlToken && urlToken === adminToken) {
      const response = NextResponse.next()
      response.cookies.set('admin_token', adminToken!, {
        httpOnly: true,
        secure: true,
        path: '/',
      })
      return response
    }

    // If cookie token matches, allow access
    if (cookieToken && cookieToken === adminToken) {
      return NextResponse.next()
    }

    // Otherwise block
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}
