'use client'
import { useEffect, useState, useCallback } from 'react'
import { Star, Trash2, RefreshCw, EyeOff, Eye } from 'lucide-react'
import { adminListAll, adminUpdate, adminDelete } from '@/lib/supabase-admin-client'

interface Testimonial { id: string; name: string; designation?: string; rating: number; review: string; is_approved: boolean; created_at: string }

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'visible'|'hidden'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('testimonials', 'created_at')
      setItems(data as Testimonial[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const remove = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return
    try { await adminDelete('testimonials', id) } catch { /* empty */ }
    load()
  }

  const hide = async (id: string) => {
    try { await adminUpdate('testimonials', id, { is_approved: false }) } catch { /* empty */ }
    load()
  }

  const show = async (id: string) => {
    try { await adminUpdate('testimonials', id, { is_approved: true }) } catch { /* empty */ }
    load()
  }

  const filtered = filter === 'all' ? items
    : filter === 'visible' ? items.filter(i => i.is_approved)
    : items.filter(i => !i.is_approved)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Star className="w-5 h-5 text-[var(--primary)]" /> Guest Reviews</h1>
          <p className="text-white/30 text-xs mt-0.5">Reviews are published immediately. Hide or delete anything inappropriate.</p>
        </div>
        <div className="flex gap-2">
          {(['all','visible','hidden'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${filter === f ? 'bg-[var(--primary)] text-black font-semibold' : 'bg-white/5 text-white/50'}`}>{f}</button>
          ))}
          <button onClick={load} className="p-2 bg-white/5 text-white/40 rounded-lg hover:text-white"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 text-xs">
        <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400">{items.filter(i => i.is_approved).length} visible</span>
        <span className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40">{items.filter(i => !i.is_approved).length} hidden</span>
        <span className="px-3 py-1.5 rounded-lg bg-white/5 text-white/30">{items.length} total</span>
      </div>

      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className={`p-4 rounded-xl border transition-opacity ${t.is_approved ? 'border-white/5 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white/90 font-medium text-sm">{t.name}</p>
                    {t.designation && <p className="text-white/30 text-xs">{t.designation}</p>}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${t.is_approved ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-white/30'}`}>
                      {t.is_approved ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? 'text-[var(--primary)] fill-[var(--primary)]' : 'text-white/20'}`} />)}</div>
                  <p className="text-white/60 text-sm italic">&ldquo;{t.review}&rdquo;</p>
                  <p className="text-white/25 text-xs mt-1">{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {t.is_approved ? (
                    <button onClick={() => hide(t.id)} title="Hide from public" className="p-1.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/70 rounded-lg">
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button onClick={() => show(t.id)} title="Make visible" className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => remove(t.id)} title="Delete permanently" className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-white/30 text-center py-10">No reviews</div>}
        </div>
      )}
    </div>
  )
}


  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Star className="w-5 h-5 text-[var(--primary)]" /> Testimonials</h1>
        <div className="flex gap-2">
          {(['all','pending','approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${filter === f ? 'bg-[var(--primary)] text-black font-semibold' : 'bg-white/5 text-white/50'}`}>{f}</button>
          ))}
          <button onClick={load} className="p-2 bg-white/5 text-white/40 rounded-lg hover:text-white"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white/90 font-medium text-sm">{t.name}</p>
                    {t.designation && <p className="text-white/30 text-xs">{t.designation}</p>}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${t.is_approved ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>{t.is_approved ? 'Approved' : 'Pending'}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? 'text-[var(--primary)] fill-[var(--primary)]' : 'text-white/20'}`} />)}</div>
                  <p className="text-white/60 text-sm italic">&ldquo;{t.review}&rdquo;</p>
                  <p className="text-white/25 text-xs mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!t.is_approved && (
                    <button onClick={() => approve(t.id, true)} className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg" title="Approve"><Check className="w-3.5 h-3.5" /></button>
                  )}
                  {t.is_approved && (
                    <button onClick={() => approve(t.id, false)} className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg" title="Unapprove"><X className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-white/30 text-center py-10">No testimonials</div>}
        </div>
      )}
    </div>
  )
}
