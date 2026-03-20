'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  PartyPopper, Plus, Trash2, Save, X, ChevronDown, ChevronUp,
  Calendar, Building2, Sparkles, Check, Loader2,
} from 'lucide-react'
import {
  getSupabaseAdmin, getActiveTenant,
  adminInsert, adminUpdate,
  getVenueBookings, type VenueBooking,
} from '@/lib/supabase-admin-client'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Venue {
  name: string
  capacity: string
  size: string
  features: string[]
}

interface EventType {
  icon: string
  title: string
  desc: string
}

interface Stat {
  value: string
  label: string
}

type Tab = 'venues' | 'types' | 'bookings'

// ─── Default data (fallbacks if not yet saved in DB) ─────────────────────────
const DEFAULT_VENUES: Venue[] = [
  { name: 'Grand Banquet Hall', capacity: '500+ guests', size: '6000 sq ft', features: ['Stage & LED wall', 'AC', 'Full catering', 'Parking for 100 cars'] },
  { name: 'Lawn & Garden',      capacity: '500+ guests', size: '0.5 acres',  features: ['Open-air', 'Night lighting', 'Bar setup', 'Live music'] },
  { name: 'Terrace Deck',       capacity: 'Up to 100 guests', size: '2000 sq ft', features: ['Rooftop views', 'Intimate setting', 'Customizable decor'] },
  { name: 'Conference Room',    capacity: '50 delegates', size: '1200 sq ft', features: ['Projector', 'Video conferencing', 'Whiteboard', 'Tea & coffee'] },
]

const DEFAULT_TYPES: EventType[] = [
  { icon: '💒', title: 'Weddings',             desc: 'Make your dream wedding a reality in our grand banquet hall with capacity for 500+ guests. Full catering, décor, and coordination.' },
  { icon: '🎂', title: 'Birthday Parties',     desc: 'From intimate family gatherings to grand celebrations. Custom cake, decoration, DJ, and delicious food.' },
  { icon: '💼', title: 'Corporate Events',     desc: 'Professional conference facilities with AV equipment, high-speed WiFi, catering, and accommodation for delegates.' },
  { icon: '🎓', title: 'Seminars & Workshops', desc: 'Fully equipped seminar halls for 50–500 participants. Projectors, sound systems, stationery included.' },
  { icon: '🙏', title: 'Religious Events',     desc: 'Celebrate Satsang, Puja, Kirtan, and religious gatherings with authentic prasad catering.' },
  { icon: '👨‍👩‍👧‍👦', title: 'Family Functions',  desc: 'Anniversaries, baby showers, retirement parties — we make every occasion special.' },
]

const DEFAULT_STATS: Stat[] = [
  { value: '500+', label: 'Guests Capacity' },
  { value: '6000 sq ft', label: 'Grand Hall' },
  { value: '15+', label: 'Years Experience' },
  { value: '100s', label: 'Events Hosted' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const today = fmt(new Date())
const nextMonth = fmt(new Date(new Date().setMonth(new Date().getMonth() + 3)))

async function loadConfig(key: string): Promise<string | null> {
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('site_config')
    .select('config_value').eq('tenant_id', getActiveTenant()).eq('config_key', key).single()
  return data?.config_value ?? null
}

async function saveConfig(key: string, value: string) {
  const sb = getSupabaseAdmin()
  const tenant = getActiveTenant()
  // upsert by tenant_id + config_key
  const { error } = await sb.from('site_config').upsert(
    { tenant_id: tenant, config_key: key, config_value: value },
    { onConflict: 'tenant_id,config_key' }
  )
  if (error) throw new Error(error.message)
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EventsAdminPage() {
  const [tab, setTab] = useState<Tab>('venues')

  // Venues state
  const [venues, setVenues]       = useState<Venue[]>(DEFAULT_VENUES)
  const [venuesSaved, setVenuesSaved] = useState(false)
  const [venuesSaving, setVenuesSaving] = useState(false)
  const [expandedVenue, setExpandedVenue] = useState<number | null>(0)

  // Event types state
  const [types, setTypes]         = useState<EventType[]>(DEFAULT_TYPES)
  const [typesSaved, setTypesSaved] = useState(false)
  const [typesSaving, setTypesSaving] = useState(false)
  const [expandedType, setExpandedType] = useState<number | null>(0)

  // Stats state
  const [stats, setStats]         = useState<Stat[]>(DEFAULT_STATS)
  const [statsSaving, setStatsSaving] = useState(false)
  const [statsSaved, setStatsSaved] = useState(false)

  // Bookings state
  const [bookings, setBookings]   = useState<VenueBooking[]>([])
  const [bLoading, setBLoading]   = useState(false)
  const [showAdd, setShowAdd]     = useState(false)
  const [addForm, setAddForm]     = useState({
    venue_name: '', event_type: 'Wedding', client_name: '',
    client_phone: '', client_email: '', event_date: '', guests: '', notes: '',
  })
  const [addSaving, setAddSaving] = useState(false)
  const [venueNames, setVenueNames] = useState<string[]>([])

  const loadAll = useCallback(async () => {
    // Load venues
    const vStr = await loadConfig('events_venues').catch(() => null)
    if (vStr) { try { setVenues(JSON.parse(vStr)) } catch { /* use default */ } }

    // Load event types
    const tStr = await loadConfig('events_types').catch(() => null)
    if (tStr) { try { setTypes(JSON.parse(tStr)) } catch { /* use default */ } }

    // Load stats
    const sStr = await loadConfig('events_stats').catch(() => null)
    if (sStr) { try { setStats(JSON.parse(sStr)) } catch { /* use default */ } }
  }, [])

  const loadBookings = useCallback(async () => {
    setBLoading(true)
    try {
      const data = await getVenueBookings(today, nextMonth)
      setBookings(data)
    } catch { /* empty */ }
    setBLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => { if (tab === 'bookings') loadBookings() }, [tab, loadBookings])

  // Keep venue names in sync for booking form dropdown
  useEffect(() => {
    setVenueNames(venues.map(v => v.name).filter(Boolean))
    setAddForm(f => ({ ...f, venue_name: venues[0]?.name || '' }))
  }, [venues])

  // ─── Save handlers ─────────────────────────────────────────────────────────
  const saveVenues = async () => {
    setVenuesSaving(true)
    try {
      await saveConfig('events_venues', JSON.stringify(venues))
      setVenuesSaved(true)
      setTimeout(() => setVenuesSaved(false), 2500)
    } catch { /* empty */ }
    setVenuesSaving(false)
  }

  const saveTypes = async () => {
    setTypesSaving(true)
    try {
      await saveConfig('events_types', JSON.stringify(types))
      setTypesSaved(true)
      setTimeout(() => setTypesSaved(false), 2500)
    } catch { /* empty */ }
    setTypesSaving(false)
  }

  const saveStats = async () => {
    setStatsSaving(true)
    try {
      await saveConfig('events_stats', JSON.stringify(stats))
      setStatsSaved(true)
      setTimeout(() => setStatsSaved(false), 2500)
    } catch { /* empty */ }
    setStatsSaving(false)
  }

  const addVenueBooking = async () => {
    if (!addForm.venue_name || !addForm.client_name || !addForm.event_date) return
    setAddSaving(true)
    try {
      await adminInsert('venue_bookings', {
        venue_name:   addForm.venue_name,
        event_type:   addForm.event_type,
        client_name:  addForm.client_name,
        client_phone: addForm.client_phone || null,
        client_email: addForm.client_email || null,
        event_date:   addForm.event_date,
        guests:       addForm.guests ? parseInt(addForm.guests) : null,
        notes:        addForm.notes || null,
        status:       'confirmed',
      })
      setShowAdd(false)
      setAddForm({ venue_name: venues[0]?.name || '', event_type: 'Wedding', client_name: '', client_phone: '', client_email: '', event_date: '', guests: '', notes: '' })
      await loadBookings()
    } catch { /* empty */ }
    setAddSaving(false)
  }

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    await adminUpdate('venue_bookings', id, { status: 'cancelled' })
    await loadBookings()
  }

  // ─── Venue helpers ─────────────────────────────────────────────────────────
  const updateVenue = (i: number, field: keyof Venue, value: string | string[]) => {
    setVenues(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }
  const addFeature = (i: number) => {
    setVenues(prev => prev.map((v, idx) => idx === i ? { ...v, features: [...v.features, ''] } : v))
  }
  const removeFeature = (i: number, fi: number) => {
    setVenues(prev => prev.map((v, idx) => idx === i ? { ...v, features: v.features.filter((_, fIdx) => fIdx !== fi) } : v))
  }
  const updateFeature = (i: number, fi: number, val: string) => {
    setVenues(prev => prev.map((v, idx) => idx === i ? { ...v, features: v.features.map((f, fIdx) => fIdx === fi ? val : f) } : v))
  }

  // ─── Event type helpers ────────────────────────────────────────────────────
  const updateType = (i: number, field: keyof EventType, value: string) => {
    setTypes(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[var(--primary)]/50 transition-colors'
  const labelCls = 'text-white/40 text-xs mb-1 block'

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-[var(--primary)]" /> Events & Venues
        </h1>
        <a href="/events" target="_blank"
          className="text-xs text-[var(--primary)] border border-[var(--primary)]/30 rounded-lg px-3 py-1.5 hover:bg-[var(--primary)]/10 transition-colors">
          Preview Events Page ↗
        </a>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 rounded-xl border border-white/10 p-0.5 w-fit gap-0.5">
        {([
          { id: 'venues',   icon: Building2,   label: 'Venues' },
          { id: 'types',    icon: Sparkles,    label: 'Event Types' },
          { id: 'bookings', icon: Calendar,    label: 'Bookings' },
        ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === id ? 'bg-[var(--primary)] text-black' : 'text-white/50 hover:text-white/80'
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: VENUES ─────────────────────────────────────────────────────── */}
      {tab === 'venues' && (
        <div className="space-y-4">
          <p className="text-white/40 text-sm">
            Edit your venue cards shown on the Events page. Changes appear immediately after saving.
          </p>

          {/* Stats row */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Page Stats (top bar)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="space-y-1">
                  <input value={s.value} onChange={e => setStats(prev => prev.map((x, xi) => xi === i ? { ...x, value: e.target.value } : x))}
                    placeholder="500+" className={inputCls} />
                  <input value={s.label} onChange={e => setStats(prev => prev.map((x, xi) => xi === i ? { ...x, label: e.target.value } : x))}
                    placeholder="Guests Capacity" className={inputCls} />
                </div>
              ))}
            </div>
            <button onClick={saveStats} disabled={statsSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black rounded-xl text-xs font-semibold disabled:opacity-50">
              {statsSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : statsSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {statsSaved ? 'Saved!' : 'Save Stats'}
            </button>
          </div>

          {/* Venue cards */}
          {venues.map((v, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              {/* Accordion header */}
              <div
                onClick={() => setExpandedVenue(expandedVenue === i ? null : i)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-white font-medium text-sm">{v.name || `Venue ${i + 1}`}</span>
                  <span className="text-white/30 text-xs hidden sm:inline">{v.capacity} · {v.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); setVenues(prev => prev.filter((_, xi) => xi !== i)) }}
                    className="text-red-400/50 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expandedVenue === i ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </div>
              </div>

              {expandedVenue === i && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div>
                      <label className={labelCls}>Venue Name</label>
                      <input value={v.name} onChange={e => updateVenue(i, 'name', e.target.value)} placeholder="Grand Banquet Hall" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Capacity</label>
                      <input value={v.capacity} onChange={e => updateVenue(i, 'capacity', e.target.value)} placeholder="500+ guests" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Size</label>
                      <input value={v.size} onChange={e => updateVenue(i, 'size', e.target.value)} placeholder="6000 sq ft" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Features / Amenities</label>
                    <div className="space-y-2">
                      {v.features.map((f, fi) => (
                        <div key={fi} className="flex gap-2">
                          <input value={f} onChange={e => updateFeature(i, fi, e.target.value)} placeholder="Feature…" className={inputCls} />
                          <button onClick={() => removeFeature(i, fi)} className="text-red-400/50 hover:text-red-400 px-2">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addFeature(i)}
                        className="text-[var(--primary)] text-xs flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3" /> Add Feature
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setVenues(prev => [...prev, { name: '', capacity: '', size: '', features: [] }]); setExpandedVenue(venues.length) }}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/15 text-white/50 rounded-xl text-sm hover:text-white hover:border-white/30 transition-colors">
              <Plus className="w-4 h-4" /> Add Venue
            </button>
            <button onClick={saveVenues} disabled={venuesSaving}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-black rounded-xl text-sm font-semibold disabled:opacity-50">
              {venuesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : venuesSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {venuesSaved ? 'Saved!' : 'Save All Venues'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: EVENT TYPES ────────────────────────────────────────────────── */}
      {tab === 'types' && (
        <div className="space-y-4">
          <p className="text-white/40 text-sm">
            Edit the event type cards shown on the Events page (Weddings, Birthday, Corporate, etc.)
          </p>

          {types.map((t, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              <div
                onClick={() => setExpandedType(expandedType === i ? null : i)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon || '🎉'}</span>
                  <span className="text-white font-medium text-sm">{t.title || `Event Type ${i + 1}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); setTypes(prev => prev.filter((_, xi) => xi !== i)) }}
                    className="text-red-400/50 hover:text-red-400 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expandedType === i ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </div>
              </div>

              {expandedType === i && (
                <div className="px-5 pb-5 space-y-3 border-t border-white/5">
                  <div className="grid grid-cols-[80px_1fr] gap-3 pt-3">
                    <div>
                      <label className={labelCls}>Icon (emoji)</label>
                      <input value={t.icon} onChange={e => updateType(i, 'icon', e.target.value)} placeholder="💒"
                        className={inputCls + ' text-center text-xl'} maxLength={4} />
                    </div>
                    <div>
                      <label className={labelCls}>Title</label>
                      <input value={t.title} onChange={e => updateType(i, 'title', e.target.value)} placeholder="Weddings" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea value={t.desc} onChange={e => updateType(i, 'desc', e.target.value)} rows={3}
                      placeholder="Description shown on the events page…"
                      className={inputCls + ' resize-none'} />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setTypes(prev => [...prev, { icon: '🎉', title: '', desc: '' }]); setExpandedType(types.length) }}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/15 text-white/50 rounded-xl text-sm hover:text-white hover:border-white/30 transition-colors">
              <Plus className="w-4 h-4" /> Add Event Type
            </button>
            <button onClick={saveTypes} disabled={typesSaving}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-black rounded-xl text-sm font-semibold disabled:opacity-50">
              {typesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : typesSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {typesSaved ? 'Saved!' : 'Save All Types'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: BOOKINGS ───────────────────────────────────────────────────── */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-sm">Upcoming venue bookings (next 3 months)</p>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-black rounded-xl text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add Booking
            </button>
          </div>

          {bLoading ? (
            <div className="text-center py-10 text-white/30 text-sm">Loading bookings…</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-14 text-white/20 text-sm">
              <PartyPopper className="w-8 h-8 mx-auto mb-3 opacity-30" />
              No upcoming venue bookings
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/8 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm">{b.client_name}</p>
                      {b.client_phone && <span className="text-white/40 text-xs">{b.client_phone}</span>}
                    </div>
                    <p className="text-[var(--primary)] text-xs mt-0.5">{b.event_type} · {b.venue_name}</p>
                    <p className="text-white/30 text-xs">
                      {new Date(b.event_date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {b.notes && <p className="text-white/25 text-xs mt-0.5 italic">&quot;{b.notes}&quot;</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 capitalize">{b.status}</span>
                    <button onClick={() => cancelBooking(b.id)} className="text-xs text-red-400/60 hover:text-red-400">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add booking modal */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-5 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">Add Venue Booking</h2>
                  <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                </div>

                <div>
                  <label className={labelCls}>Venue</label>
                  <select value={addForm.venue_name} onChange={e => setAddForm(p => ({ ...p, venue_name: e.target.value }))}
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                    {venueNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Event Type</label>
                  <select value={addForm.event_type} onChange={e => setAddForm(p => ({ ...p, event_type: e.target.value }))}
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                    {['Wedding', 'Reception', 'Birthday', 'Corporate Event', 'Engagement', 'Anniversary', 'Seminar', 'Religious Event', 'Other'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <input value={addForm.client_name} onChange={e => setAddForm(p => ({ ...p, client_name: e.target.value }))} placeholder="Client name *"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                <input value={addForm.client_phone} onChange={e => setAddForm(p => ({ ...p, client_phone: e.target.value }))} placeholder="Phone"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                <input value={addForm.client_email} onChange={e => setAddForm(p => ({ ...p, client_email: e.target.value }))} placeholder="Email (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Event Date *</label>
                    <input type="date" value={addForm.event_date} min={today} onChange={e => setAddForm(p => ({ ...p, event_date: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className={labelCls}>Guests (approx.)</label>
                    <input type="number" value={addForm.guests} onChange={e => setAddForm(p => ({ ...p, guests: e.target.value }))} placeholder="200"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                  </div>
                </div>
                <textarea value={addForm.notes} onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none resize-none" />

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
                  <button onClick={addVenueBooking} disabled={addSaving || !addForm.client_name || !addForm.event_date}
                    className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {addSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {addSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
