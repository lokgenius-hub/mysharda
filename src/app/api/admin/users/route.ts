import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, display_name, role, is_active, last_login, created_at')
    .order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}

export async function POST(req: NextRequest) {
  const { username, display_name, password, role } = await req.json()
  if (!username || !password) return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  const password_hash = await hashPassword(password)
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert([{ username, display_name: display_name || username, password_hash, role: role || 'staff', is_active: true }])
    .select('id, username, display_name, role')
    .single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ user: data })
}

export async function PATCH(req: NextRequest) {
  const { id, is_active, role } = await req.json()
  const update: Record<string, unknown> = {}
  if (is_active !== undefined) update.is_active = is_active
  if (role) update.role = role
  const { error } = await supabaseAdmin.from('admin_users').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('admin_users').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
