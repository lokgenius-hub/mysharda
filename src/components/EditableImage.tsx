'use client'
/**
 * EditableImage
 *
 * Drop-in replacement for next/image <Image>.
 * – For regular visitors: renders exactly like <Image>, zero overhead.
 * – For logged-in admins: shows a pencil overlay button on hover.
 *   Clicking it opens an inline modal to upload a new file or paste a URL,
 *   which immediately replaces the image on the live website.
 *
 * Usage:
 *   <EditableImage imageKey="heroHome" src={images.heroHome} alt="..." fill className="..." />
 */

import { useState, useEffect, useCallback } from 'react'
import Image, { type ImageProps } from 'next/image'
import { Pencil, X, Upload, Check } from 'lucide-react'
import { getAdminSession, getSupabaseAdmin, adminUpdate, adminInsert, adminListAll } from '@/lib/supabase-admin-client'
import { IMAGE_KEY_LABELS, clearSiteImagesCache } from '@/lib/use-site-images'

// ─── types ───────────────────────────────────────────────────────────────────
interface EditableImageProps extends Omit<ImageProps, 'src'> {
  /** The image_key that identifies this slot in the site_images table */
  imageKey: string
  /** Current URL (from useSiteImages hook) */
  src: string
}

type SiteImageRow = { id: string; url: string; image_key?: string }

// ─── component ───────────────────────────────────────────────────────────────
export default function EditableImage({ imageKey, src, alt, ...rest }: EditableImageProps) {
  const [isAdmin, setIsAdmin]         = useState(false)
  const [hovered, setHovered]         = useState(false)
  const [modalOpen, setModalOpen]     = useState(false)
  const [file, setFile]               = useState<File | null>(null)
  const [busy, setBusy]               = useState(false)
  const [done, setDone]               = useState(false)
  const [liveSrc, setLiveSrc]         = useState(src)

  // Check admin session once on mount
  useEffect(() => {
    getAdminSession().then(s => setIsAdmin(!!s)).catch(() => {})
  }, [])

  // Keep liveSrc in sync when the parent re-renders with a new URL
  useEffect(() => { setLiveSrc(src) }, [src])

  const openModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFile(null)
    setDone(false)
    setModalOpen(true)
  }, [])

  const closeModal = () => {
    setModalOpen(false)
    setFile(null)
    setBusy(false)
    setDone(false)
  }

  // ── helpers ─────────────────────────────────────────────────────────────────
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
  const MAX     = 10 * 1024 * 1024

  /** Fetch the existing DB row for this imageKey (we need its id for UPDATE) */
  const fetchExisting = async (): Promise<SiteImageRow | null> => {
    try {
      const rows = await adminListAll('site_images', 'created_at') as SiteImageRow[]
      // newest row for this key
      return [...rows].reverse().find(r => r.image_key === imageKey) ?? null
    } catch { return null }
  }

  /** Bust cache + fire event so useSiteImages re-fetches everywhere */
  const bust = () => {
    clearSiteImagesCache()
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('site-images-updated'))
  }

  /** Save via server API route (preferred when Next.js server is running) */
  const saveViaAPI = async (formData: FormData): Promise<string | null> => {
    const sb = getSupabaseAdmin()
    const { data: { session } } = await sb.auth.getSession()
    const token = session?.access_token ?? ''

    const res = await fetch('/api/admin/images/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error ?? 'Upload failed')
    return json?.image?.url ?? null
  }

  /** Upload file directly from browser to Supabase Storage (static-host fallback) */
  const saveViaStorage = async (f: File): Promise<string> => {
    const sb = getSupabaseAdmin()
    const bucket = 'site-images'
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
      'image/gif': '.gif', 'image/avif': '.avif', 'image/svg+xml': '.svg',
    }
    const ext     = extMap[f.type] ?? '.bin'
    const safeKey = imageKey.replace(/[^a-zA-Z0-9_-]/g, '_')
    const filename = `${safeKey}-${Date.now()}${ext}`

    // delete old file first
    const existing = await fetchExisting()
    if (existing?.url) {
      try {
        const parts = existing.url.split('/site-images/')
        if (parts.length === 2) await sb.storage.from(bucket).remove([decodeURIComponent(parts[1].split('?')[0])])
      } catch { /* best-effort */ }
    }

    const { error: upErr } = await sb.storage.from(bucket).upload(filename, f, { contentType: f.type, upsert: true, cacheControl: '3600' })
    if (upErr) throw upErr

    const { data: pub } = sb.storage.from(bucket).getPublicUrl(filename)
    const publicUrl = pub?.publicUrl ?? ''

    // upsert DB row
    if (existing?.id) {
      await adminUpdate('site_images', existing.id, { url: publicUrl, is_active: true })
    } else {
      const category = imageKey.startsWith('hero') ? 'hero' : imageKey.startsWith('room') ? 'rooms' :
        imageKey.startsWith('service') ? 'services' : imageKey.startsWith('cuisine') || imageKey.startsWith('restaurant') ? 'food' :
        imageKey.startsWith('event') ? 'events' : imageKey.startsWith('travel') ? 'travel' :
        imageKey.startsWith('gallery') ? 'gallery' : 'general'
      await adminInsert('site_images', { image_key: imageKey, url: publicUrl, alt: IMAGE_KEY_LABELS[imageKey] ?? imageKey, category, sort_order: 0, is_active: true })
    }

    return publicUrl
  }

  // ── main save handler ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!file) return
    setBusy(true)
    try {
      if (!ALLOWED.includes(file.type)) throw new Error(`File type "${file.type}" is not allowed.`)
      if (file.size > MAX) throw new Error('File exceeds 10 MB')

      let newUrl: string | null = null

      // try server route first
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('image_key', imageKey)
        fd.append('alt', IMAGE_KEY_LABELS[imageKey] ?? imageKey)
        newUrl = await saveViaAPI(fd)
      } catch (serverErr) {
        const msg = serverErr instanceof Error ? serverErr.message : ''
        if (msg === 'Unauthorized' || msg.includes('not allowed') || msg.includes('exceeds')) throw serverErr
        // fallback to browser-direct upload
        newUrl = await saveViaStorage(file)
      }

      if (newUrl) setLiveSrc(newUrl)
      bust()
      setDone(true)
      setTimeout(closeModal, 800)
    } catch (e) {
      alert('Save failed: ' + (e instanceof Error ? e.message : 'Unknown'))
    }
    setBusy(false)
  }

  // ── render ───────────────────────────────────────────────────────────────────
  const label = IMAGE_KEY_LABELS[imageKey] ?? imageKey

  return (
    <>
      {/* The image itself — unchanged for visitors */}
      <Image src={liveSrc} alt={alt ?? label} {...rest} />

      {/* Pencil overlay — only for admins */}
      {isAdmin && (
        <div
          className="absolute inset-0 z-10"
          style={{ pointerEvents: 'none' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* We need pointer events ON this inner layer */}
          <div className="absolute inset-0" style={{ pointerEvents: 'all' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {hovered && (
              <button
                onClick={openModal}
                title={`Edit: ${label}`}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/80 border border-[#c9a84c]/50 text-[#c9a84c] text-[10px] font-semibold backdrop-blur-sm hover:bg-[#c9a84c] hover:text-black transition-all z-20 shadow-lg"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit modal — fixed overlay, never clipped */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-md bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <p className="text-white font-semibold text-sm">Edit Image</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current preview */}
            <div className="mx-5 mt-4 aspect-video rounded-xl overflow-hidden bg-white/5 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={liveSrc} alt={label} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-0.5 bg-black/70 text-white/60 text-[10px] rounded-full">{label}</span>
              </div>
            </div>

            {/* File upload */}
            <div className="px-5 mt-4 pb-5 space-y-4">
              <div>
                <label className="block text-white/50 text-xs mb-2">
                  Select image (JPEG, PNG, WebP, GIF, AVIF, SVG · max 10 MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-white/60 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#c9a84c]/20 file:text-[#c9a84c] file:text-xs file:font-semibold hover:file:bg-[#c9a84c]/30 file:cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-white/40 text-xs truncate">
                    {file.name} · {(file.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-xs font-semibold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={busy || done || !file}
                  className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                >
                  {done ? (
                    <><Check className="w-3.5 h-3.5" /> Saved!</>
                  ) : busy ? (
                    <><span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" /> Save</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
