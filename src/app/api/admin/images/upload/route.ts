export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as Blob | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const imageKey = formData.get('image_key')?.toString()
    const alt = formData.get('alt')?.toString() ?? null
    const category = formData.get('category')?.toString() ?? null

    const bucket = 'site-images'
    // Ensure bucket exists (ignore error if it already does)
    try { await supabaseAdmin.storage.createBucket(bucket, { public: true }) } catch (e) { /* ignore */ }

    // Derive an extension from the original filename or mime type
    const rawName: any = (file as any).name || ''
    let ext = ''
    if (rawName && typeof rawName === 'string' && rawName.includes('.')) {
      ext = '.' + rawName.split('.').pop()
    } else {
      const mime = (file as any).type || ''
      if (mime.includes('/')) ext = '.' + mime.split('/')[1]
    }

    const filename = `${imageKey ?? 'image'}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const path = `${filename}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, { contentType: (file as any).type })
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    const publicUrl = publicData?.publicUrl ?? ''

    const { data, error } = await supabaseAdmin.from('site_images').insert([{ image_key: imageKey, url: publicUrl, alt, category, sort_order: 0, is_active: true }]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ image: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
