/**
 * site-config-defaults.ts — no 'use client', safe to import in server components,
 * metadata files, layout.tsx, API routes, and client components alike.
 *
 * These are the fallback values used when Supabase hasn't loaded yet or
 * a key is missing from the DB.
 *
 * Key fields read from NEXT_PUBLIC_* env vars first — so the correct
 * tenant name/contact show immediately on first render, with no flash.
 * Content fields (about text, taglines) start empty and fill from Supabase.
 */

const _name    = process.env.NEXT_PUBLIC_HOTEL_NAME    || 'Our Hotel'
const _phone   = process.env.NEXT_PUBLIC_HOTEL_PHONE   || ''
const _wa      = process.env.NEXT_PUBLIC_HOTEL_WHATSAPP || ''
const _address = process.env.NEXT_PUBLIC_HOTEL_ADDRESS || ''
const _email   = process.env.NEXT_PUBLIC_HOTEL_EMAIL   || ''

export const DEFAULT_CONFIG: Record<string, string> = {
  hotel_name:         _name,
  tagline:            '',
  description:        '',
  phone:              _phone   ? `+91 ${_phone}` : '',
  phone_2:            '',
  phone_3:            '',
  email:              _email,
  whatsapp:           _wa,
  address:            _address,
  facebook_url:       'https://facebook.com',
  instagram_url:      'https://instagram.com',
  youtube_url:        'https://youtube.com',
  google_maps_embed:  '',
  google_maps_link:   '',
  gst_number:         '',
  restaurant_hours:   '',
  reception_hours:    '',
  checkin_time:       '12:00 Noon',
  checkout_time:      '11:00 AM',

  // ── Homepage About section ────────────────────────────────────────────────
  about_heading:      '',
  about_text_1:       '',
  about_text_2:       '',
  about_badge_number: '15+',
  about_badge_label:  'Years of Excellence',

  // ── Homepage Location section ─────────────────────────────────────────────
  location_text:      '',

  // ── Hotel page ────────────────────────────────────────────────────────────
  hotel_tagline:      '',

  // ── Restaurant page ───────────────────────────────────────────────────────
  restaurant_tagline: '',
  restaurant_about:   '',

  // ── Events page ───────────────────────────────────────────────────────────
  events_tagline:     '',
  // ── Homepage / Events stats (admin-editable in "Homepage Stats" section) ──
  stat_guests_capacity:  '500+',
  stat_hall_size:        '6000 sq ft',
  stat_years_experience: '15+',
  stat_events_hosted:    '100s',}

/** Ensure any URL always has https:// prefix. Safe to use server-side too. */
export function safeUrl(url: string | undefined): string {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}
