export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin.from('travel_packages').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ packages: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('travel_packages').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ package: data })
}

export async function PUT(req: NextRequest) {
  const { id, ...body } = await req.json()
  const { data, error } = await supabaseAdmin.from('travel_packages').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ package: data })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  await supabaseAdmin.from('travel_packages').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
