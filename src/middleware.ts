import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

// Only run middleware on admin & admin-API paths (not public website)
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Login page itself is always accessible
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return NextResponse.next();
  }

  const session = getSessionFromRequest(req);

  if (!session) {
    // API call — return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page — redirect to login
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Inject user info as headers for downstream use
  const res = NextResponse.next();
  res.headers.set("x-user-id", session.userId);
  res.headers.set("x-user-role", session.role);
  return res;
}
