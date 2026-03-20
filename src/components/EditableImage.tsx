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
import { createPortal } from 'react-dom'
import Image, { type ImageProps } from 'next/image'
import { Pencil, X, Upload, Check } from 'lucide-react'
import { getAdminSession, getSupabaseAdmin, adminUpdate, adminInsert, getActiveTenant } from '@/lib/supabase-admin-client'
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
  const [urlInput, setUrlInput]       = useState('')
  const [tab, setTab]                 = useState<'upload' | 'url'>('upload')
  const [busy, setBusy]               = useState(false)
  const [done, setDone]               = useState(false)
  const [liveSrc, setLiveSrc]         = useState(src)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Check Supabase Auth session once on mount
  useEffect(() => {
    getAdminSession().then(s => setIsAdmin(!!s)).catch(() => {})
  }, [])

  // Keep liveSrc in sync when the parent re-renders with a new URL
  useEffect(() => { setLiveSrc(src) }, [src])

  const openModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFile(null)
    setUrlInput('')
    setTab('upload')
    setDone(false)
    setModalOpen(true)
  }, [])

  const closeModal = () => {
    setModalOpen(false)
    setFile(null)
    setUrlInput('')
    setBusy(false)
    setDone(false)
  }

  // ── helpers ─────────────────────────────────────────────────────────────────
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
  const MAX     = 10 * 1024 * 1024

  /** Fetch the existing DB row for this imageKey (we need its id for UPDATE) */
  const fetchExisting = async (): Promise<SiteImageRow | null> => {
    try {
      const sb = getSupabaseAdmin()
      const { data } = await sb
        .from('site_images')
        .select('*')
        .eq('tenant_id', getActiveTenant())
        .eq('image_key', imageKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return (data as SiteImageRow | null)
    } catch { return null }
  }

  /** Bust cache + fire event so useSiteImages re-fetches everywhere */
  const bust = () => {
    clearSiteImagesCache()
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('site-images-updated'))
  }

  /** Upload file directly from browser to Supabase Storage */
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
      const TENANT = getActiveTenant()
      if (existing?.id) {
        await adminUpdate('site_images', existing.id, { url: publicUrl, is_active: true })
      } else {
        const category = imageKey.startsWith('hero') ? 'hero' : imageKey.startsWith('room') ? 'rooms' :
          imageKey.startsWith('service') ? 'services' : imageKey.startsWith('cuisine') || imageKey.startsWith('restaurant') ? 'food' :
          imageKey.startsWith('event') ? 'events' : imageKey.startsWith('travel') ? 'travel' :
          imageKey.startsWith('gallery') ? 'gallery' : 'general'
        await adminInsert('site_images', { tenant_id: TENANT, image_key: imageKey, url: publicUrl, alt: IMAGE_KEY_LABELS[imageKey] ?? imageKey, category, sort_order: 0, is_active: true })
      }

    return publicUrl
  }

  /** Save a raw URL directly to the DB (no Storage upload) */
  const saveViaUrl = async (url: string): Promise<string> => {
    const existing = await fetchExisting()
    const TENANT = getActiveTenant()
    if (existing?.id) {
      await adminUpdate('site_images', existing.id, { url, is_active: true })
    } else {
      const category = imageKey.startsWith('hero') ? 'hero' : imageKey.startsWith('room') ? 'rooms' :
        imageKey.startsWith('service') ? 'services' : imageKey.startsWith('cuisine') || imageKey.startsWith('restaurant') ? 'food' :
        imageKey.startsWith('event') ? 'events' : imageKey.startsWith('travel') ? 'travel' :
        imageKey.startsWith('gallery') ? 'gallery' : 'general'
      await adminInsert('site_images', { tenant_id: TENANT, image_key: imageKey, url, alt: IMAGE_KEY_LABELS[imageKey] ?? imageKey, category, sort_order: 0, is_active: true })
    }
    return url
  }

  // ── main save handler ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setBusy(true)
    try {
      let newUrl = ''
      if (tab === 'url') {
        const trimmed = urlInput.trim()
        if (!trimmed) throw new Error('Please enter an image URL')
        if (!trimmed.startsWith('http')) throw new Error('URL must start with http:// or https://')
        newUrl = await saveViaUrl(trimmed)
      } else {
        if (!file) throw new Error('Please select a file')
        if (!ALLOWED.includes(file.type)) throw new Error(`File type "${file.type}" is not allowed.`)
        if (file.size > MAX) throw new Error('File exceeds 10 MB')
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
                className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/80 border border-[var(--primary)]/50 text-[var(--primary)] text-[10px] font-semibold backdrop-blur-sm hover:bg-[var(--primary)] hover:text-black transition-all z-20 shadow-lg"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit modal — rendered via Portal at document.body so it is NEVER
           clipped by overflow-hidden / backdrop-filter stacking contexts       */}
      {modalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.78)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-md bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
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
            <div className="mx-5 mt-4 rounded-xl overflow-hidden bg-white/5 relative" style={{ height: '180px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={liveSrc} alt={label} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-0.5 bg-black/70 text-white/60 text-[10px] rounded-full">{label}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex mx-5 mt-4 bg-white/5 rounded-xl p-0.5 gap-0.5">
              <button onClick={() => setTab('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'upload' ? 'bg-[var(--primary)] text-black' : 'text-white/40 hover:text-white'}`}>
                Upload File
              </button>
              <button onClick={() => setTab('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === 'url' ? 'bg-[var(--primary)] text-black' : 'text-white/40 hover:text-white'}`}>
                Paste URL
              </button>
            </div>

            {/* File upload */}
            <div className="px-5 mt-4 pb-5 space-y-4">
              {tab === 'upload' ? (
                <div>
                  <label className="block text-white/50 text-xs mb-2">
                    Select image (JPEG, PNG, WebP, GIF, AVIF, SVG · max 10 MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                    className="w-full text-white/60 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--primary)]/20 file:text-[var(--primary)] file:text-xs file:font-semibold hover:file:bg-[var(--primary)]/30 file:cursor-pointer"
                  />
                  {file && (
                    <p className="mt-2 text-white/40 text-xs truncate">
                      {file.name} · {(file.size / 1024).toFixed(0)} KB
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-white/50 text-xs mb-2">
                    Image URL (must start with https://)
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[var(--primary)]/50 placeholder-white/20"
                  />
                  {urlInput && (
                    <div className="mt-2 rounded-lg overflow-hidden h-20 bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={urlInput} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              )}

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
                  disabled={busy || done || (tab === 'upload' ? !file : !urlInput.trim())}
                  className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-black text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                >
                  {done ? (
                    <><Check className="w-3.5 h-3.5" /> Saved!</>
                  ) : busy ? (
                    <><span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" /> Save Image</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
