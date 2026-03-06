import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data } = await supabaseAdmin.from('coin_config').select('*').single()
  return NextResponse.json({ config: data })
}
