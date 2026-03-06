import { NextResponse } from "next/server";

/**
 * Middleware is effectively a no-op for the static export (GitHub Pages).
 * Admin auth is handled client-side via Supabase Auth in the admin layout.
 *
 * When running locally (dev server), this middleware just passes through.
 * The admin layout component checks the Supabase session and redirects
 * unauthenticated users to /admin/login.
 */
export const config = {
  matcher: [],   // No routes matched → middleware is effectively disabled
};

export function middleware() {
  return NextResponse.next();
}
