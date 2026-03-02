import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const adminToken = process.env.ADMIN_TOKEN;

  // If token isn't configured, never allow admin routes
  if (!adminToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const urlToken = request.nextUrl.searchParams.get("token");
  const cookieToken = request.cookies.get("admin_token")?.value;

  // If URL token matches, set cookie and allow access
  if (urlToken && urlToken === adminToken) {
    const response = NextResponse.next();

    response.cookies.set("admin_token", adminToken, {
      httpOnly: true,
      secure: true,        // requires https (Vercel is https)
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  }

  // If cookie token matches, allow access
  if (cookieToken === adminToken) {
    return NextResponse.next();
  }

  // Otherwise block
  return NextResponse.redirect(new URL("/", request.url));
}

// Run middleware only for admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
