import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_BASIC_USER || "admin";
  const pass = process.env.ADMIN_BASIC_PASS || "change-me";
  const auth = req.headers.get("authorization");

  if (!auth) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Carascan Admin"' }
    });
  }

  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) return NextResponse.json({ error: "Bad auth" }, { status: 401 });

  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const [u, p] = decoded.split(":");
  if (u != user || p != pass) return new NextResponse("Unauthorized", { status: 401 });

  return NextResponse.next();
}
