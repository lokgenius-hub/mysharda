'use client'
import { useEffect, useState, useCallback } from 'react'
import { Image as ImageIcon, Plus, Trash2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { adminListAll, adminInsert, adminDelete } from '@/lib/supabase-admin-client'

interface SiteImage { id: string; url: string; alt?: string; category?: string; is_active: boolean }

const CATS = ['general','hotel','restaurant','events','gallery','team']

export default function ImagesPage() {
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [cat, setCat] = useState('gallery')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('site_images', 'category')
      setImages(data as SiteImage[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const addImage = async () => {
    if (!url) return; setSaving(true)
    try { await adminInsert('site_images', { url, alt, category: cat }) } catch { /* empty */ }
    setUrl(''); setAlt(''); setAdding(false); setSaving(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete?')) return
    try { await adminDelete('site_images', id) } catch { /* empty */ }
    load()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#c9a84c]" /> Gallery / Images</h1>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 bg-white/5 text-white/40 hover:text-white rounded-lg"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
            <Plus className="w-4 h-4" /> Add Image
          </button>
        </div>
      </div>

      {adding && (
        <div className="p-4 rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/5 space-y-3">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Image URL (https://...)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
          <div className="flex gap-3">
            <input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Alt text / caption"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            <select value={cat} onChange={e => setCat(e.target.value)} className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
            <button onClick={addImage} disabled={saving || !url} className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black font-semibold text-sm disabled:opacity-50">
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-white/5">
              <div className="aspect-video bg-white/5 relative">
                <Image src={img.url} alt={img.alt ?? ''} fill className="object-cover" onError={() => {}} />
              </div>
              <div className="p-2">
                <p className="text-white/50 text-xs truncate">{img.alt || img.url.split('/').pop()}</p>
                <p className="text-[#c9a84c] text-[10px]">{img.category}</p>
              </div>
              <button onClick={() => del(img.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {images.length === 0 && <div className="col-span-full text-white/30 text-center py-10">No images yet. Add image URLs above.</div>}
        </div>
      )}
    </div>
  )
}
