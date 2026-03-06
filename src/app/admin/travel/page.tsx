'use client'
import { useEffect, useState, useCallback } from 'react'
import { MapPin, Plus, Pencil, X, Save } from 'lucide-react'
import { adminListAll, adminInsert, adminUpdate } from '@/lib/supabase-admin-client'

interface Package { id: string; title: string; description?: string; price: number; duration?: string; inclusions?: string[]; is_active: boolean; sort_order: number }
const blank = (): Partial<Package> => ({ title: '', description: '', price: 0, duration: '', inclusions: [], is_active: true, sort_order: 0 })

export default function TravelAdminPage() {
  const [pkgs, setPkgs] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Package> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inclText, setInclText] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('travel_packages', 'sort_order')
      setPkgs(data as Package[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openEdit = (p: Package) => { setEditing({ ...p }); setInclText((p.inclusions ?? []).join('\n')); setIsNew(false) }
  const openNew = () => { setEditing(blank()); setInclText(''); setIsNew(true) }

  const save = async () => {
    if (!editing) return; setSaving(true)
    const inclusions = inclText.split('\n').map(s => s.trim()).filter(Boolean)
    try {
      if (isNew) {
        await adminInsert('travel_packages', { ...editing, inclusions })
      } else {
        await adminUpdate('travel_packages', editing.id as string, { ...editing, inclusions })
      }
    } catch { /* empty */ }
    setSaving(false); setEditing(null); load()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-[#c9a84c]" /> Travel Packages</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>
      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pkgs.map(p => (
            <div key={p.id} className={`p-5 rounded-xl border border-white/5 bg-white/[0.02] transition-opacity ${p.is_active ? '' : 'opacity-40'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-white/90 font-semibold">{p.title}</p>
                  {p.duration && <p className="text-[#c9a84c] text-xs mt-0.5">{p.duration}</p>}
                  {p.description && <p className="text-white/40 text-sm mt-1 line-clamp-2">{p.description}</p>}
                </div>
                <button onClick={() => openEdit(p)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[#c9a84c] font-bold text-xl mt-3">₹{p.price.toLocaleString()}</p>
            </div>
          ))}
          {!pkgs.length && <div className="col-span-full text-white/30 text-center py-10">No packages yet</div>}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-full max-w-lg space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">{isNew ? 'Add Package' : 'Edit Package'}</h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={editing.title ?? ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="Package title"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            <textarea value={editing.description ?? ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={editing.price ?? 0} onChange={e => setEditing(p => ({ ...p, price: Number(e.target.value) }))} placeholder="Price (₹)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
              <input value={editing.duration ?? ''} onChange={e => setEditing(p => ({ ...p, duration: e.target.value }))} placeholder="Duration (e.g. 3N/4D)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs">Inclusions (one per line)</label>
              <textarea value={inclText} onChange={e => setInclText(e.target.value)} placeholder="Hotel accommodation&#10;Breakfast&#10;Sightseeing" rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none resize-none mt-1" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} className="accent-[#c9a84c]" />
              <span className="text-white/60 text-sm">Active / Visible on website</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
