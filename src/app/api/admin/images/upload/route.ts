export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Allowed MIME types — strictly enforced server-side
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'])

// 10 MB server-side cap to protect Supabase free-tier storage
const MAX_BYTES = 10 * 1024 * 1024

/** Verify the caller is a signed-in Supabase user by checking the Bearer token. */
async function verifyAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return false
  // supabaseAdmin (service-role) can verify any JWT issued for this project
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return !error && !!user
}

/** Map MIME type to a safe file extension (never trust user-supplied filename). */
function safeExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
    'image/gif': '.gif', 'image/avif': '.avif', 'image/svg+xml': '.svg',
  }
  return map[mimeType] ?? '.bin'
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────────────────
    const isAuthed = await verifyAuth(req)
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Parse form data ─────────────────────────────────────────────────────
    const formData = await req.formData()
    const file = formData.get('file') as Blob | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // ── 3. Server-side MIME type validation ────────────────────────────────────
    const mimeType = ((file as unknown as { type?: string }).type) ?? ''
    if (!ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not allowed. Only JPEG, PNG, WebP, GIF, AVIF, SVG are accepted.` },
        { status: 400 }
      )
    }

    // ── 4. Server-side size validation ─────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })
    }
    const buffer = new Uint8Array(arrayBuffer)

    const imageKey = formData.get('image_key')?.toString() ?? null
    const alt = formData.get('alt')?.toString() ?? imageKey ?? null

    const bucket = 'site-images'
    try { await supabaseAdmin.storage.createBucket(bucket, { public: true }) } catch { /* already exists */ }

    // ── 5. Check for existing DB row for this image_key ─────────────────────────
    const { data: existing } = imageKey
      ? await supabaseAdmin.from('site_images').select('*').eq('image_key', imageKey).maybeSingle()
      : { data: null }

    // ── 6. Delete old storage file if it exists ─────────────────────────────────
    if (existing?.url) {
      try {
        const urlParts = (existing.url as string).split('/site-images/')
        if (urlParts.length === 2) {
          const oldPath = decodeURIComponent(urlParts[1].split('?')[0])
          await supabaseAdmin.storage.from(bucket).remove([oldPath])
        }
      } catch { /* best-effort — don't fail upload if old file can't be deleted */ }
    }

    // ── 7. Upload new file with stable, sanitised name ──────────────────────────
    const ext = safeExt(mimeType)
    const safeKey = (imageKey ?? 'image').replace(/[^a-zA-Z0-9_-]/g, '_')
    const filename = `${safeKey}-${Date.now()}${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: mimeType, upsert: true, cacheControl: '3600' })
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename)
    const publicUrl = publicData?.publicUrl ?? ''

    // ── 8. Upsert DB row (update if exists, insert if new) ──────────────────────
    const category = !imageKey ? 'general'
      : imageKey.startsWith('hero') ? 'hero'
      : imageKey.startsWith('room') ? 'rooms'
      : imageKey.startsWith('service') ? 'services'
      : imageKey.startsWith('cuisine') || imageKey.startsWith('restaurant') ? 'food'
      : imageKey.startsWith('event') ? 'events'
      : imageKey.startsWith('travel') ? 'travel'
      : imageKey.startsWith('gallery') ? 'gallery'
      : 'general'

    let dbResult
    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from('site_images')
        .update({ url: publicUrl, alt, category, is_active: true })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      dbResult = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('site_images')
        .insert([{ image_key: imageKey, url: publicUrl, alt, category, sort_order: 0, is_active: true }])
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      dbResult = data
    }

    return NextResponse.json({ image: dbResult })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
