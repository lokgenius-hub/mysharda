'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { RefreshCw, Upload, CheckCircle2, AlertCircle, Image as ImageIcon, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { adminListAll, adminUpdate, adminInsert, getSupabaseAdmin } from '@/lib/supabase-admin-client'
import { DEFAULT_IMAGES, IMAGE_KEY_LABELS, clearSiteImagesCache } from '@/lib/use-site-images'

interface SiteImage { id: string; url: string; alt?: string; category?: string; image_key?: string; is_active: boolean }

// ── 19 curated slots across 6 pages ──────────────────────────────────────────
const KEY_GROUPS: { title: string; page: string; keys: string[] }[] = [
  { title: 'Homepage',    page: '/',           keys: ['heroHome', 'aboutImage', 'ctaBanner', 'serviceHotel', 'serviceRestaurant', 'serviceEvents'] },
  { title: 'Hotel',       page: '/hotel',      keys: ['heroHotel', 'roomStandard', 'roomDeluxe', 'roomSuite'] },
  { title: 'Restaurant',  page: '/restaurant', keys: ['heroRestaurant', 'cuisineNorthIndian', 'cuisineVeg', 'cuisineSweets', 'restaurantInterior'] },
  { title: 'Menu',        page: '/menu',       keys: ['heroMenu'] },
  { title: 'Events',      page: '/events',     keys: ['heroEvents', 'eventWedding', 'eventBirthday', 'eventCorporate'] },
  { title: 'Travel',      page: '/travel',     keys: ['heroTravel', 'travelVrindavan', 'travelMathura', 'travelAgra'] },
  { title: 'Blog',        page: '/blog',       keys: ['heroBlog'] },
]

const TOTAL_SLOTS = KEY_GROUPS.reduce((s, g) => s + g.keys.length, 0) // 19
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
const MAX_BYTES = 10 * 1024 * 1024

type UploadState = { status: 'idle' | 'uploading' | 'done' | 'error'; message?: string }

export default function ImagesPage() {
  const [dbImages, setDbImages]   = useState<SiteImage[]>([])
  const [loading, setLoading]     = useState(true)
  const [states, setStates]       = useState<Record<string, UploadState>>({})
  const fileRefs                  = useRef<Record<string, HTMLInputElement | null>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('site_images', 'created_at')
      setDbImages(data as SiteImage[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const keyToImage = new Map(
    dbImages.filter(i => i.image_key).map(i => [i.image_key!, i])
  )

  const getUrl = (key: string) => keyToImage.get(key)?.url ?? DEFAULT_IMAGES[key] ?? ''

  const setState = (key: string, s: UploadState) =>
    setStates(prev => ({ ...prev, [key]: s }))

  const uploadFile = async (key: string, file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState(key, { status: 'error', message: 'Only JPEG, PNG, WebP, GIF, AVIF, SVG allowed' })
      return
    }
    if (file.size > MAX_BYTES) {
      setState(key, { status: 'error', message: 'File must be under 10 MB' })
      return
    }
    setState(key, { status: 'uploading' })
    try {
      // Direct browser → Supabase Storage (works on static export and server)
      const sb = getSupabaseAdmin()
      const bucket = 'site-images'
      const extMap: Record<string, string> = {
        'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
        'image/gif': '.gif', 'image/avif': '.avif', 'image/svg+xml': '.svg',
      }
      const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
      const filename = `${safeKey}-${Date.now()}${extMap[file.type] ?? '.bin'}`

      // Delete old file
      const existing = keyToImage.get(key)
      if (existing?.url) {
        try {
          const parts = existing.url.split('/site-images/')
          if (parts.length === 2) await sb.storage.from(bucket).remove([decodeURIComponent(parts[1].split('?')[0])])
        } catch { /* best-effort */ }
      }

      const { error: upErr } = await sb.storage.from(bucket).upload(filename, file, { contentType: file.type, upsert: true, cacheControl: '3600' })
      if (upErr) throw upErr

      const { data: pub } = sb.storage.from(bucket).getPublicUrl(filename)
      const publicUrl = pub?.publicUrl ?? ''

      const category = key.startsWith('hero') ? 'hero' : key.startsWith('room') ? 'rooms' :
        key.startsWith('cuisine') || key.startsWith('restaurant') ? 'food' :
        key.startsWith('event') ? 'events' : key.startsWith('travel') ? 'travel' :
        key.startsWith('gallery') ? 'gallery' : 'general'

      if (existing?.id) {
        await adminUpdate('site_images', existing.id, { url: publicUrl, is_active: true })
      } else {
        await adminInsert('site_images', { image_key: key, url: publicUrl, alt: IMAGE_KEY_LABELS[key] ?? key, category, sort_order: 0, is_active: true })
      }

      await load()
      clearSiteImagesCache()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('site-images-updated'))
      setState(key, { status: 'done' })
      setTimeout(() => setState(key, { status: 'idle' }), 2500)
    } catch (e) {
      setState(key, { status: 'error', message: e instanceof Error ? e.message : 'Upload failed' })
    }
  }

  const uploadedCount = KEY_GROUPS.flatMap(g => g.keys).filter(k => keyToImage.has(k)).length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[var(--primary)]" /> Site Images
          </h1>
          <p className="text-white/40 text-xs mt-1">Upload images from your computer — max 10 MB · JPEG PNG WebP GIF AVIF</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Storage usage indicator */}
          <div className="text-right">
            <p className="text-white/60 text-xs">{uploadedCount} / {TOTAL_SLOTS} uploaded</p>
            <div className="mt-1 h-1.5 w-28 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all"
                style={{ width: `${(uploadedCount / TOTAL_SLOTS) * 100}%` }}
              />
            </div>
          </div>
          <button onClick={load} className="p-2 bg-white/5 text-white/40 hover:text-white rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {KEY_GROUPS.map(group => (
            <div key={group.title}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div>
                  <h2 className="text-white font-bold text-sm">{group.title}</h2>
                  <p className="text-white/30 text-[11px] mt-0.5">{group.page}</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-white/20 text-xs">{group.keys.length} images</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.keys.map(key => {
                  const currentUrl = getUrl(key)
                  const label = IMAGE_KEY_LABELS[key] ?? key
                  const st = states[key] ?? { status: 'idle' }
                  const isCustom = keyToImage.has(key)

                  return (
                    <div
                      key={key}
                      className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-[var(--primary)]/30 transition-all duration-200"
                    >
                      {/* Image preview */}
                      <div className="aspect-video relative bg-white/5">
                        {currentUrl && (
                          <Image src={currentUrl} alt={label} fill className="object-cover" unoptimized />
                        )}

                        {/* Dim overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />

                        {/* Status overlay */}
                        {st.status === 'uploading' && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                            <div className="w-7 h-7 border-2 border-[var(--primary)]/40 border-t-[var(--primary)] rounded-full animate-spin" />
                            <p className="text-white/70 text-[10px]">Uploading...</p>
                          </div>
                        )}
                        {st.status === 'done' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                          </div>
                        )}

                        {/* Top badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-black/70 backdrop-blur text-white/80 text-[9px] font-semibold rounded-full">{label}</span>
                          {isCustom && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-semibold rounded-full">Custom</span>
                          )}
                        </div>

                        {/* Open in new tab */}
                        {currentUrl && (
                          <a
                            href={currentUrl} target="_blank" rel="noopener noreferrer"
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white/40 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-3">
                        {st.status === 'error' && (
                          <div className="flex items-center gap-1.5 mb-2 text-red-400 text-[10px]">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{st.message}</span>
                          </div>
                        )}

                        {/* Hidden file input */}
                        <input
                          type="file" accept="image/*"
                          className="hidden"
                          ref={el => { fileRefs.current[key] = el }}
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) uploadFile(key, f)
                            e.target.value = ''
                          }}
                        />

                        <button
                          onClick={() => fileRefs.current[key]?.click()}
                          disabled={st.status === 'uploading'}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-[var(--primary)]/15 border border-white/[0.06] hover:border-[var(--primary)]/30 text-white/50 hover:text-[var(--primary)] text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {st.status === 'uploading' ? 'Uploading...' : isCustom ? 'Replace Image' : 'Upload Image'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
