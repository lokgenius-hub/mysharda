'use client'
import { useEffect, useState, useCallback } from 'react'
import { Hotel, Plus, Pencil, X, Save, Bed } from 'lucide-react'

interface Room { id: string; name: string; type: string; capacity: number; price_per_night: number; status: 'available'|'occupied'|'maintenance'|'cleaning'; amenities?: string[]; is_active: boolean }
const blank = (): Partial<Room> => ({ name: '', type: 'Standard', capacity: 2, price_per_night: 2500, status: 'available', is_active: true, amenities: [] })
const TYPES = ['Standard','Deluxe','Suite','Banquet','Conference']
const STATUSES = ['available','occupied','maintenance','cleaning'] as const

const statusStyle: Record<string, string> = {
  available: 'bg-green-500/15 text-green-400 border-green-500/20',
  occupied: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  maintenance: 'bg-red-500/15 text-red-400 border-red-500/20',
  cleaning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Room> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/rooms')
    if (r.ok) { const d = await r.json(); setRooms(d.rooms ?? []) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: typeof STATUSES[number]) => {
    await fetch('/api/admin/rooms', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    load()
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const method = isNew ? 'POST' : 'PUT'
    await fetch('/api/admin/rooms', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    setSaving(false); setEditing(null); load()
  }

  const summary = { available: rooms.filter(r => r.status === 'available').length, occupied: rooms.filter(r => r.status === 'occupied').length }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Hotel className="w-5 h-5 text-[#c9a84c]" /> Rooms</h1>
        <button onClick={() => { setEditing(blank()); setIsNew(true) }} className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUSES.map(s => (
          <div key={s} className={`p-3 rounded-xl border ${statusStyle[s]} text-center`}>
            <p className="text-2xl font-bold">{rooms.filter(r => r.status === s).length}</p>
            <p className="text-xs capitalize mt-0.5 opacity-70">{s}</p>
          </div>
        ))}
      </div>
      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rooms.map(room => (
            <div key={room.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/90 font-medium flex items-center gap-2"><Bed className="w-4 h-4 text-[#c9a84c]" />{room.name}</p>
                  <p className="text-white/40 text-xs">{room.type} · {room.capacity} guests</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditing({ ...room }); setIsNew(false) }} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[#c9a84c] font-bold">₹{room.price_per_night?.toLocaleString()}/night</p>
                <div className="flex gap-1">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(room.id, s)}
                      className={`px-2 py-1 rounded-lg text-[10px] capitalize transition-colors ${room.status === s ? statusStyle[s] + ' border' : 'bg-white/5 text-white/30 hover:text-white/60'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">{isNew ? 'Add Room' : 'Edit Room'}</h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={editing.name ?? ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Room name (e.g. Room 101)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs">Type</label>
                <select value={editing.type} onChange={e => setEditing(p => ({ ...p, type: e.target.value }))} className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs">Capacity</label>
                <input type="number" value={editing.capacity ?? 2} onChange={e => setEditing(p => ({ ...p, capacity: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1" />
              </div>
              <div>
                <label className="text-white/40 text-xs">Price/Night (₹)</label>
                <input type="number" value={editing.price_per_night ?? 0} onChange={e => setEditing(p => ({ ...p, price_per_night: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1" />
              </div>
              <div>
                <label className="text-white/40 text-xs">Status</label>
                <select value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value as typeof STATUSES[number] }))} className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
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
