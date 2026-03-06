export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin.from('restaurant_tables').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tables: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('restaurant_tables').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ table: data })
}

export async function PUT(req: NextRequest) {
  const { id, ...body } = await req.json()
  const { data, error } = await supabaseAdmin.from('restaurant_tables').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ table: data })
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  const { error } = await supabaseAdmin.from('restaurant_tables').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await supabaseAdmin.from('restaurant_tables').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
