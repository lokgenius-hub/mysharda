'use client'
import { useEffect, useState, useCallback } from 'react'
import { MapPin, Plus, Pencil, X, Save, Check, Loader2, Globe } from 'lucide-react'
import { adminListAll, adminInsert, adminUpdate, getSupabaseAdmin, getActiveTenant } from '@/lib/supabase-admin-client'

interface Package { id: string; title: string; description?: string; price: number; duration?: string; inclusions?: string[]; is_active: boolean; sort_order: number }
interface Destination { name: string; imgKey: string; desc: string }

const blank = (): Partial<Package> => ({ title: '', description: '', price: 0, duration: '', inclusions: [], is_active: true, sort_order: 0 })

const DEFAULT_DESTINATIONS: Destination[] = [
  { name: 'Vrindavan',       imgKey: 'travelVrindavan', desc: 'Land of Lord Krishna — temples, ghats, and spiritual bliss' },
  { name: 'Mathura',         imgKey: 'travelMathura',   desc: 'Birthplace of Lord Krishna — sacred, vibrant, ancient' },
  { name: 'Agra & Taj Mahal', imgKey: 'travelAgra',     desc: 'One of the seven wonders — awe-inspiring marble marvel' },
]

async function loadConfig(key: string): Promise<string | null> {
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('site_config').select('config_value')
    .eq('tenant_id', getActiveTenant()).eq('config_key', key).single()
  return data?.config_value ?? null
}
async function saveConfig(key: string, value: string) {
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('site_config').upsert(
    { tenant_id: getActiveTenant(), config_key: key, config_value: value },
    { onConflict: 'tenant_id,config_key' }
  )
  if (error) throw new Error(error.message)
}

type Tab = 'packages' | 'destinations'

export default function TravelAdminPage() {
  const [tab, setTab] = useState<Tab>('packages')

  // ── Packages ──────────────────────────────────────────────────────────────
  const [pkgs, setPkgs]       = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Package> | null>(null)
  const [isNew, setIsNew]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [inclText, setInclText] = useState('')

  // ── Destinations ──────────────────────────────────────────────────────────
  const [dests, setDests]         = useState<Destination[]>(DEFAULT_DESTINATIONS)
  const [destSaving, setDestSaving] = useState(false)
  const [destSaved, setDestSaved]   = useState(false)
  const [editDest, setEditDest]     = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('travel_packages', 'sort_order')
      setPkgs(data as Package[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])

  const loadDests = useCallback(async () => {
    const str = await loadConfig('travel_destinations').catch(() => null)
    if (str) { try { setDests(JSON.parse(str)) } catch { /* use default */ } }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadDests() }, [loadDests])

  const openEdit = (p: Package) => { setEditing({ ...p }); setInclText((p.inclusions ?? []).join('\n')); setIsNew(false) }
  const openNew  = () => { setEditing(blank()); setInclText(''); setIsNew(true) }

  const save = async () => {
    if (!editing) return; setSaving(true)
    const inclusions = inclText.split('\n').map(s => s.trim()).filter(Boolean)
    try {
      if (isNew) { await adminInsert('travel_packages', { ...editing, inclusions }) }
      else { await adminUpdate('travel_packages', editing.id as string, { ...editing, inclusions }) }
    } catch { /* empty */ }
    setSaving(false); setEditing(null); load()
  }

  const saveDests = async () => {
    setDestSaving(true)
    try {
      await saveConfig('travel_destinations', JSON.stringify(dests))
      setDestSaved(true); setTimeout(() => setDestSaved(false), 2500)
    } catch { /* empty */ }
    setDestSaving(false)
  }

  const updateDest = (i: number, field: keyof Destination, val: string) =>
    setDests(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d))

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[var(--primary)]/50'

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--primary)]" /> Travel
        </h1>
        {tab === 'packages' && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 rounded-xl border border-white/10 p-0.5 w-fit gap-0.5">
        {([
          { id: 'packages',     icon: MapPin, label: 'Tour Packages' },
          { id: 'destinations', icon: Globe,  label: 'Popular Destinations' },
        ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === id ? 'bg-[var(--primary)] text-black' : 'text-white/50 hover:text-white/80'
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── PACKAGES tab ──────────────────────────────────────────────────── */}
      {tab === 'packages' && (
        loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pkgs.map(p => (
              <div key={p.id} className={`p-5 rounded-xl border border-white/5 bg-white/[0.02] transition-opacity ${p.is_active ? '' : 'opacity-40'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-white/90 font-semibold">{p.title}</p>
                    {p.duration && <p className="text-[var(--primary)] text-xs mt-0.5">{p.duration}</p>}
                    {p.description && <p className="text-white/40 text-sm mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <button onClick={() => openEdit(p)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[var(--primary)] font-bold text-xl mt-3">₹{p.price.toLocaleString()}</p>
              </div>
            ))}
            {!pkgs.length && <div className="col-span-full text-white/30 text-center py-10">No packages yet</div>}
          </div>
        )
      )}

      {/* ── DESTINATIONS tab ──────────────────────────────────────────────── */}
      {tab === 'destinations' && (
        <div className="space-y-4">
          <p className="text-white/40 text-sm">
            Edit the &quot;Popular Destinations&quot; cards shown on the Travel page. The destination image is changed via the pencil icon on the Travel page itself.
          </p>

          {dests.map((d, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              <div onClick={() => setEditDest(editDest === i ? null : i)}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-white font-medium text-sm">{d.name || `Destination ${i + 1}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); setDests(prev => prev.filter((_, xi) => xi !== i)) }}
                    className="text-red-400/50 hover:text-red-400 p-1 text-xs">✕</button>
                  <span className="text-white/30 text-xs">{editDest === i ? '▲' : '▼'}</span>
                </div>
              </div>

              {editDest === i && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Destination Name</label>
                      <input value={d.name} onChange={e => updateDest(i, 'name', e.target.value)} placeholder="Vrindavan" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Image Key (don&apos;t change unless needed)</label>
                      <input value={d.imgKey} onChange={e => updateDest(i, 'imgKey', e.target.value)} placeholder="travelVrindavan" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Description</label>
                    <textarea value={d.desc} onChange={e => updateDest(i, 'desc', e.target.value)} rows={2}
                      placeholder="Short description shown on card…" className={inputCls + ' resize-none'} />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setDests(prev => [...prev, { name: '', imgKey: `travel${Date.now()}`, desc: '' }]); setEditDest(dests.length) }}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/15 text-white/50 rounded-xl text-sm hover:text-white">
              <Plus className="w-4 h-4" /> Add Destination
            </button>
            <button onClick={saveDests} disabled={destSaving}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-black rounded-xl text-sm font-semibold disabled:opacity-50">
              {destSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : destSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {destSaved ? 'Saved!' : 'Save Destinations'}
            </button>
          </div>
        </div>
      )}

      {/* Package edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-5 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
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
              <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} className="accent-[var(--primary)]" />
              <span className="text-white/60 text-sm">Active / Visible on website</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
