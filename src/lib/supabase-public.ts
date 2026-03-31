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

/** Tenant ID for this deployment — all public queries must filter by this */
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || 'sharda'

/** Fetch public menu items */
export async function getPublicMenu() {
  const { data } = await supabasePublic
    .from("menu_items")
    .select("*")
    .eq("tenant_id", TENANT)
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
    .eq("tenant_id", TENANT)
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

/** Fetch public testimonials (all auto-approved on submit; admin deletes bad ones) */
export async function getPublicTestimonials() {
  const { data } = await supabasePublic
    .from("testimonials")
    .select("id, name, rating, review, designation, created_at")
    .eq("tenant_id", TENANT)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

/** Submit a guest testimonial — auto-approved so it shows immediately */
export async function submitTestimonial(payload: {
  name: string;
  rating: number;
  review: string;
  designation?: string;
}) {
  const { error } = await supabasePublic.from("testimonials").insert({
    ...payload,
    tenant_id: TENANT,
    is_approved: true,
  });
  if (error) throw new Error(error.message);
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
    tenant_id: TENANT,
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
    .eq("tenant_id", TENANT)
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

/** Fetch single blog post by slug */
export async function getPublicBlogPostBySlug(slug: string) {
  const { data, error } = await supabasePublic
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, cover_image, published_at, category")
    .eq("tenant_id", TENANT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("[Blog] getPublicBlogPostBySlug error:", error.message);
  return data ?? null;
}

/** Fetch blog posts */
export async function getPublicBlogPosts(limit = 10) {
  const { data, error } = await supabasePublic
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, published_at, category")
    .eq("tenant_id", TENANT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) console.error("[Blog] getPublicBlogPosts error:", error.message);
  return data ?? [];
}

/** Fetch room types */
export async function getPublicRooms() {
  const { data, error } = await supabasePublic
    .from("rooms")
    .select("*")
    .eq("tenant_id", TENANT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    const { data: fallback } = await supabasePublic
      .from("rooms")
      .select("*")
      .eq("tenant_id", TENANT)
      .eq("is_active", true)
      .order("name");
    return fallback ?? [];
  }
  return data ?? [];
}

/** Fetch active room bookings for availability calendar */
export async function getPublicBookings(from: string, to: string) {
  const { data } = await supabasePublic
    .from("room_bookings")
    .select("room_id, check_in, check_out")
    .or(`check_in.lte.${to},check_out.gte.${from}`)
    .in("status", ["confirmed", "checked_in"]);
  return data ?? [];
}

/** Fetch venue bookings for availability */
export async function getPublicVenueBookings(from: string, to: string) {
  const { data } = await supabasePublic
    .from("venue_bookings")
    .select("venue_name, event_date, event_type")
    .gte("event_date", from)
    .lte("event_date", to)
    .eq("status", "confirmed");
  return data ?? [];
}

/** Look up a customer's loyalty coin balance by phone (public — requires RLS SELECT policy on coin_profiles) */
export async function getPublicCoinBalance(phone: string): Promise<{ balance: number; name: string | null } | null> {
  const { data } = await supabasePublic
    .from("coin_profiles")
    .select("balance, name")
    .eq("tenant_id", TENANT)
    .eq("phone", phone)
    .maybeSingle();
  return data ?? null;
}

/** Fetch the public coin config (earn/redeem rates) for display on the loyalty page */
export async function getPublicCoinConfig(): Promise<{ spend_per_coin: number; coin_value: number; min_redeem: number } | null> {
  const { data } = await supabasePublic
    .from("coin_config")
    .select("spend_per_coin, coin_value, min_redeem")
    .eq("tenant_id", TENANT)
    .maybeSingle();
  return data ?? null;
}
