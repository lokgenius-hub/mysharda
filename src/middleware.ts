import { NextResponse } from "next/server";

/**
 * ARCHITECTURE: GitHub Pages static export + Supabase only.
 * There are NO Next.js API routes in this project (src/app/api/ does not exist).
 * Auth, database, storage and edge functions are all handled by Supabase directly.
 * This middleware is a no-op — it exists only as a placeholder.
 */
export const config = {
  matcher: [], // No routes matched — middleware is disabled
};

export function middleware() {
  return NextResponse.next();
}
