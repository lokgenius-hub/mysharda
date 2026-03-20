import type { NextConfig } from "next";

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ARCHITECTURE: GITHUB PAGES (static) + SUPABASE (only backend)         ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                          ║
 * ║  THIS PROJECT HAS NO NODE.JS / EXPRESS / NEXT.JS API ROUTES.            ║
 * ║  Do NOT add src/app/api/ routes — they will be ignored on static build. ║
 * ║                                                                          ║
 * ║  All backend logic is handled by Supabase:                               ║
 * ║    • Auth       → Supabase Auth (signInWithPassword / getSession)        ║
 * ║    • Database   → Supabase JS client with RLS policies                   ║
 * ║    • Storage    → Supabase Storage (direct browser uploads)              ║
 * ║    • Functions  → Supabase Edge Functions (chat-ai, notify-enquiry)      ║
 * ║                                                                          ║
 * ║  Admin panel auth uses:                                                  ║
 * ║    • Supabase Auth session (JWT stored in localStorage by Supabase SDK)  ║
 * ║    • RLS policies check jwt user_metadata.tenant_id for data isolation   ║
 * ║    • src/lib/supabase-admin-client.ts  ← ONLY admin lib needed           ║
 * ║    • src/lib/supabase-public.ts        ← public read-only queries        ║
 * ║                                                                          ║
 * ║  Deploy:                                                                 ║
 * ║    npm run build  → out/ folder → push to GitHub Pages                  ║
 * ║    No server. No Docker. No VPS. Zero cost.                              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

const nextConfig: NextConfig = {
  // Always static export — this project has no server-side routes
  output: "export",
  // GitHub Pages serves under /repo-name — set NEXT_PUBLIC_BASE_PATH to your repo name
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // next/image optimization not supported in static export
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
