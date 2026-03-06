/**
 * SUPABASE ADMIN CLIENT (browser-side)
 *
 * Uses the same ANON key as the public client, but the user must be
 * signed in via Supabase Auth. RLS policies allow authenticated users
 * to INSERT / UPDATE / DELETE on admin-managed tables.
 *
 * This means the admin panel works on the STATIC GitHub Pages site
 * — no backend server, no API routes needed.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Singleton — persists session in localStorage
let _client: SupabaseClient | null = null
export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(url, key, {
      auth: {
        persistSession: true,          // keep login across page reload
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return _client
}

// ─── Auth helpers ───────────────────────────────────────────

export async function adminSignIn(email: string, password: string) {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

export async function adminSignOut() {
  const sb = getSupabaseAdmin()
  await sb.auth.signOut()
}

export async function getAdminSession() {
  const sb = getSupabaseAdmin()
  const { data: { session } } = await sb.auth.getSession()
  return session
}

// ─── Generic CRUD helpers ───────────────────────────────────

type Row = Record<string, unknown>

/** Fetch all rows from a table */
export async function adminList(table: string, opts?: { column?: string; value?: unknown; orderBy?: string; ascending?: boolean; activeOnly?: boolean; limit?: number }) {
  const sb = getSupabaseAdmin()
  let q = sb.from(table).select('*')
  if (opts?.activeOnly !== false && ['rooms','menu_items','restaurant_tables','travel_packages','site_images'].includes(table)) {
    q = q.eq('is_active', true)
  }
  if (opts?.column && opts?.value !== undefined) {
    q = q.eq(opts.column, opts.value)
  }
  if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? true })
  if (opts?.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data ?? []
}

/** Fetch all rows including inactive */
export async function adminListAll(table: string, orderBy = 'created_at') {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from(table).select('*').order(orderBy, { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

/** Insert a new row */
export async function adminInsert(table: string, row: Row) {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from(table).insert(row).select().single()
  if (error) throw new Error(error.message)
  return data
}

/** Update a row by id */
export async function adminUpdate(table: string, id: string, updates: Row) {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from(table).update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

/** Soft-delete (set is_active = false) */
export async function adminSoftDelete(table: string, id: string) {
  return adminUpdate(table, id, { is_active: false })
}

/** Hard delete */
export async function adminDelete(table: string, id: string) {
  const sb = getSupabaseAdmin()
  const { error } = await sb.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Room Booking helpers ───────────────────────────────────

export interface RoomBooking {
  id: string
  room_id: string
  guest_name: string
  guest_phone?: string
  check_in: string
  check_out: string
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  notes?: string
  created_at: string
}

/** Get bookings for a date range (for calendar) */
export async function getBookings(from: string, to: string): Promise<RoomBooking[]> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('room_bookings')
    .select('*')
    .or(`check_in.lte.${to},check_out.gte.${from}`)
    .in('status', ['confirmed', 'checked_in'])
    .order('check_in')
  if (error) throw new Error(error.message)
  return (data ?? []) as RoomBooking[]
}

/** Get bookings for a specific room */
export async function getRoomBookings(roomId: string): Promise<RoomBooking[]> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('room_bookings')
    .select('*')
    .eq('room_id', roomId)
    .in('status', ['confirmed', 'checked_in'])
    .order('check_in')
  if (error) throw new Error(error.message)
  return (data ?? []) as RoomBooking[]
}

// ─── Venue Booking helpers ──────────────────────────────────

export interface VenueBooking {
  id: string
  venue_name: string
  event_type: string
  client_name: string
  client_phone?: string
  event_date: string
  status: string
  notes?: string
}

export async function getVenueBookings(from: string, to: string): Promise<VenueBooking[]> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('venue_bookings')
    .select('*')
    .gte('event_date', from)
    .lte('event_date', to)
    .eq('status', 'confirmed')
    .order('event_date')
  if (error) throw new Error(error.message)
  return (data ?? []) as VenueBooking[]
}
