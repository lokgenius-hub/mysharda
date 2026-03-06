/**
 * SUPABASE SERVER CLIENT
 * Uses the SERVICE_ROLE_KEY — bypasses Row Level Security.
 * ONLY used in Next.js API routes and server components.
 * NEVER imported in pages/components that run in the browser.
 * NEVER prefixed with NEXT_PUBLIC_.
 */
import { createClient } from "@supabase/supabase-js";
// import type { Database } from "./database.types"; // Enable once you generate real types

// These are server-only env vars — never exposed to browser
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

if (serviceRoleKey === 'placeholder' && process.env.NODE_ENV !== 'test') {
  console.warn('[Supabase Server] SUPABASE_SERVICE_ROLE_KEY not set — set it in .env.local');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Re-export for convenience
export { supabaseAdmin as db };
