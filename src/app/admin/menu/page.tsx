'use client'
import { useEffect, useState, useCallback } from 'react'
import { Utensils, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { adminListAll, adminInsert, adminUpdate, adminDelete } from '@/lib/supabase-admin-client'

interface MenuItem { id: string; name: string; category: string; price: number; description?: string; is_veg: boolean; tax_rate: number; is_active: boolean; sort_order: number }

const blank = (): Partial<MenuItem> => ({ name: '', category: 'Starters', price: 0, description: '', is_veg: true, tax_rate: 5, is_active: true, sort_order: 0 })
const CATS = ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages', 'Chinese', 'South Indian', 'Snacks']
const TAX_OPTS = [0, 5, 12, 18]

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [catFilter, setCatFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('menu_items', 'sort_order')
      setItems(data as MenuItem[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const openEdit = (item: MenuItem) => { setEditing({ ...item }); setIsNew(false) }
  const openNew = () => { setEditing(blank()); setIsNew(true) }
  const close = () => { setEditing(null); setIsNew(false) }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (isNew) {
        await adminInsert('menu_items', { name: editing.name, category: editing.category, price: editing.price, description: editing.description, is_veg: editing.is_veg, tax_rate: editing.tax_rate, is_active: editing.is_active, sort_order: editing.sort_order })
      } else {
        await adminUpdate('menu_items', editing.id as string, { name: editing.name, category: editing.category, price: editing.price, description: editing.description, is_veg: editing.is_veg, tax_rate: editing.tax_rate, is_active: editing.is_active, sort_order: editing.sort_order })
      }
    } catch { /* empty */ }
    setSaving(false); close(); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try { await adminDelete('menu_items', id) } catch { /* empty */ }
    load()
  }

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = catFilter === 'all' ? items : items.filter(i => i.category === catFilter)

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Utensils className="w-5 h-5 text-[#c9a84c]" /> Menu</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${catFilter === c ? 'bg-[#c9a84c] text-black font-semibold' : 'bg-white/5 text-white/50 hover:text-white'}`}>
            {c === 'all' ? `All (${items.length})` : c}
          </button>
        ))}
      </div>
      {loading ? <div className="flex items-center justify-center h-32 text-white/30">Loading...</div> : (
        <div className="grid grid-cols-1 gap-2">
          {filtered.map(item => (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-opacity ${item.is_active ? '' : 'opacity-40'}`}>
              <span className={`w-3 h-3 rounded-sm border shrink-0 ${item.is_veg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-medium">{item.name}</p>
                <p className="text-white/30 text-xs">{item.category} · GST {item.tax_rate}%{!item.is_active ? ' · Inactive' : ''}</p>
              </div>
              <p className="text-[#c9a84c] font-bold text-sm shrink-0">₹{item.price}</p>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(item.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">{isNew ? 'Add Item' : 'Edit Item'}</h2>
              <button onClick={close} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {[['name','Item Name','text'],['description','Description (optional)','text']].map(([k,ph]) => (
              <input key={k} value={(editing as Record<string,string>)[k] ?? ''} onChange={e => setEditing(p => ({ ...p, [k]: e.target.value }))} placeholder={ph}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#c9a84c]/30" />
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs">Price (₹)</label>
                <input type="number" value={editing.price ?? 0} onChange={e => setEditing(p => ({ ...p, price: Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#c9a84c]/30 mt-1" />
              </div>
              <div>
                <label className="text-white/40 text-xs">Category</label>
                <select value={editing.category} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#c9a84c]/30 mt-1">
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs">GST Rate</label>
                <select value={editing.tax_rate} onChange={e => setEditing(p => ({ ...p, tax_rate: Number(e.target.value) }))}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1">
                  {TAX_OPTS.map(t => <option key={t} value={t}>{t}%</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs">Sort Order</label>
                <input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1" />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_veg} onChange={e => setEditing(p => ({ ...p, is_veg: e.target.checked }))} className="accent-green-500" />
                <span className="text-white/60 text-sm">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} className="accent-[#c9a84c]" />
                <span className="text-white/60 text-sm">Active</span>
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={close} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black font-semibold text-sm hover:bg-[#d4af5a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
