/**
 * SUPABASE PUBLIC CLIENT
 * Uses the ANON key — safe to ship in browser / GitHub Pages static build.
 * The anon key is READ-ONLY by default. Row Level Security must be enabled.
 *
 * NEVER put SERVICE_ROLE_KEY here.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (typeof window !== 'undefined' && supabaseUrl.includes('placeholder')) {
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL — set it in .env.local');
}

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

/** Fetch public menu items */
export async function getPublicMenu() {
  const { data } = await supabasePublic
    .from("menu_items")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("sort_order");
  return data ?? [];
}

/** Fetch public gallery images */
export async function getPublicGallery() {
  const { data } = await supabasePublic
    .from("site_images")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

/** Fetch approved testimonials */
export async function getPublicTestimonials() {
  const { data } = await supabasePublic
    .from("testimonials")
    .select("id, name, rating, review, created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

/** Submit enquiry (works from GitHub Pages — no server needed) */
export async function submitEnquiry(payload: {
  name: string;
  phone: string;
  email?: string;
  enquiry_type: string;
  message?: string;
  preferred_date?: string;
  guests?: number;
}) {
  const { error } = await supabasePublic.from("enquiries").insert({
    ...payload,
    status: "pending",
    is_read: false,
  });
  if (error) throw new Error(error.message);
}

/** Fetch active travel packages */
export async function getPublicPackages() {
  const { data } = await supabasePublic
    .from("travel_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

/** Fetch blog posts */
export async function getPublicBlogPosts(limit = 10) {
  const { data } = await supabasePublic
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, published_at, category")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/** Fetch room types */
export async function getPublicRooms() {
  const { data, error } = await supabasePublic
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  // If sort_order column doesn't exist yet (migration not run), fall back
  if (error) {
    const { data: fallback } = await supabasePublic
      .from("rooms")
      .select("*")
      .eq("is_active", true)
      .order("name");
    return fallback ?? [];
  }
  return data ?? [];
}

/** Fetch active room bookings for availability calendar (public read via RLS) */
export async function getPublicBookings(from: string, to: string) {
  const { data } = await supabasePublic
    .from("room_bookings")
    .select("room_id, check_in, check_out")
    .or(`check_in.lte.${to},check_out.gte.${from}`)
    .in("status", ["confirmed", "checked_in"]);
  return data ?? [];
}

/** Fetch venue bookings for availability (public read via RLS) */
export async function getPublicVenueBookings(from: string, to: string) {
  const { data } = await supabasePublic
    .from("venue_bookings")
    .select("venue_name, event_date, event_type")
    .gte("event_date", from)
    .lte("event_date", to)
    .eq("status", "confirmed");
  return data ?? [];
}
