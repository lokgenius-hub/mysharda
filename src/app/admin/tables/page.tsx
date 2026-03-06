'use client'
import { useEffect, useState, useCallback } from 'react'
import { LayoutGrid, Plus, Pencil, X, Save } from 'lucide-react'

interface RestTable { id: string; name: string; capacity: number; status: 'available'|'occupied'|'reserved'|'cleaning'; is_active: boolean }
const STATUSES = ['available','occupied','reserved','cleaning'] as const
const statusStyle: Record<string, string> = {
  available: 'bg-green-500/15 text-green-400', occupied: 'bg-blue-500/15 text-blue-400',
  reserved: 'bg-amber-500/15 text-amber-400', cleaning: 'bg-pink-500/15 text-pink-400',
}

export default function TablesPage() {
  const [tables, setTables] = useState<RestTable[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<RestTable> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/tables')
    if (r.ok) { const d = await r.json(); setTables(d.tables ?? []) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: typeof STATUSES[number]) => {
    await fetch('/api/admin/tables', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    load()
  }

  const save = async () => {
    if (!editing) return; setSaving(true)
    await fetch('/api/admin/tables', { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    setSaving(false); setEditing(null); load()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-[#c9a84c]" /> Restaurant Tables</h1>
        <button onClick={() => { setEditing({ name: '', capacity: 4, status: 'available', is_active: true }); setIsNew(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
          <Plus className="w-4 h-4" /> Add Table
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUSES.map(s => (
          <div key={s} className={`p-3 rounded-xl ${statusStyle[s]} text-center`}>
            <p className="text-2xl font-bold">{tables.filter(t => t.status === s).length}</p>
            <p className="text-xs capitalize opacity-70">{s}</p>
          </div>
        ))}
      </div>
      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tables.map(t => (
            <div key={t.id} className={`p-4 rounded-xl border border-white/5 space-y-3 transition-opacity ${t.is_active ? '' : 'opacity-40'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/90 font-semibold">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.capacity} seats</p>
                </div>
                <button onClick={() => { setEditing({ ...t }); setIsNew(false) }} className="p-1 text-white/30 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(t.id, s)}
                    className={`py-1 rounded-lg text-[10px] capitalize transition-colors ${t.status === s ? statusStyle[s] : 'bg-white/5 text-white/30'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">{isNew ? 'Add Table' : 'Edit Table'}</h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={editing.name ?? ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Table name (e.g. T-1)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            <input type="number" value={editing.capacity ?? 4} onChange={e => setEditing(p => ({ ...p, capacity: Number(e.target.value) }))} placeholder="Capacity"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
