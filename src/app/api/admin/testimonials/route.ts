export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin.from('testimonials').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ testimonials: data })
}

export async function PATCH(req: NextRequest) {
  const { id, is_approved } = await req.json()
  const { error } = await supabaseAdmin.from('testimonials').update({ is_approved }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
