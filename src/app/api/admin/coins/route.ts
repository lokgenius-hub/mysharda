export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })
  const { data } = await supabaseAdmin.from('coin_profiles').select('name, balance').eq('phone', phone).single()
  return NextResponse.json({ profile: data ?? null })
}
