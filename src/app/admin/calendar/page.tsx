'use client'
import { useEffect, useState, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Save, Bed, PartyPopper } from 'lucide-react'
import {
  adminListAll, adminInsert, adminUpdate,
  getBookings, getVenueBookings, type RoomBooking, type VenueBooking,
} from '@/lib/supabase-admin-client'

type Tab = 'rooms' | 'venues'
interface Room { id: string; name: string; type: string; status: string }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500/80',
  checked_in: 'bg-green-500/80',
  checked_out: 'bg-gray-500/60',
  cancelled: 'bg-red-500/40',
  completed: 'bg-gray-500/60',
}

// Use local date parts to avoid UTC timezone off-by-one (e.g. IST midnight = UTC prev day)
function fmt(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function CalendarPage() {
  const [tab, setTab] = useState<Tab>('rooms')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([])
  const [venueBookings, setVenueBookings] = useState<VenueBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ room_id: '', guest_name: '', guest_phone: '', check_in: '', check_out: '', notes: '' })
  const [venueForm, setVenueForm] = useState({ venue_name: 'Grand Banquet Hall', event_type: 'Wedding', client_name: '', client_phone: '', event_date: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startPad = firstDay.getDay()

  const from = fmt(new Date(year, month, 1))
  const to = fmt(new Date(year, month + 1, 0))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [r, rb, vb] = await Promise.all([
        adminListAll('rooms', 'sort_order'),
        getBookings(from, to),
        getVenueBookings(from, to),
      ])
      setRooms(r as Room[])
      setRoomBookings(rb)
      setVenueBookings(vb)
    } catch { /* empty */ }
    setLoading(false)
  }, [from, to])
  useEffect(() => { load() }, [load])

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const today = () => { setYear(new Date().getFullYear()); setMonth(new Date().getMonth()) }

  // Count bookings per day
  function bookingsOnDay(day: number): RoomBooking[] {
    const d = fmt(new Date(year, month, day))
    return roomBookings.filter(b => b.check_in <= d && b.check_out > d && b.status !== 'cancelled')
  }
  function venuesOnDay(day: number): VenueBooking[] {
    const d = fmt(new Date(year, month, day))
    return venueBookings.filter(b => b.event_date === d && b.status !== 'cancelled')
  }

  const saveRoom = async () => {
    setSaving(true)
    try {
      await adminInsert('room_bookings', { ...addForm, status: 'confirmed' })
      setShowAdd(false)
      setAddForm({ room_id: '', guest_name: '', guest_phone: '', check_in: '', check_out: '', notes: '' })
      await load()
    } catch { /* empty */ }
    setSaving(false)
  }

  const saveVenue = async () => {
    setSaving(true)
    try {
      await adminInsert('venue_bookings', { ...venueForm, status: 'confirmed' })
      setShowAdd(false)
      setVenueForm({ venue_name: 'Grand Banquet Hall', event_type: 'Wedding', client_name: '', client_phone: '', event_date: '', notes: '' })
      await load()
    } catch { /* empty */ }
    setSaving(false)
  }

  const cancelBooking = async (table: string, id: string) => {
    if (!confirm('Cancel this booking?')) return
    await adminUpdate(table, id, { status: 'cancelled' })
    await load()
  }

  // Details for selected date
  const selRoomBookings = selectedDate ? roomBookings.filter(b => b.check_in <= selectedDate && b.check_out > selectedDate && b.status !== 'cancelled') : []
  const selVenueBookings = selectedDate ? venueBookings.filter(b => b.event_date === selectedDate && b.status !== 'cancelled') : []

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--primary)]" /> Bookings Calendar
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-xl border border-white/10 p-0.5">
            {(['rooms', 'venues'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-[var(--primary)] text-black' : 'text-white/50 hover:text-white/80'}`}>
                {t === 'rooms' ? <><Bed className="w-3 h-3 inline mr-1" />Rooms</> : <><PartyPopper className="w-3 h-3 inline mr-1" />Venues</>}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-black rounded-xl text-xs font-semibold hover:bg-[#d4af5a]">
            <Plus className="w-3.5 h-3.5" /> Add Booking
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
        <button onClick={prev} className="text-white/40 hover:text-white p-1"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-3">
          <h2 className="text-white font-semibold">{MONTHS[month]} {year}</h2>
          <button onClick={today} className="text-xs text-[var(--primary)] hover:underline">Today</button>
        </div>
        <button onClick={next} className="text-white/40 hover:text-white p-1"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {loading ? (
        <div className="text-white/30 text-center py-10">Loading bookings...</div>
      ) : (
        /* Calendar grid */
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-white/30 text-xs font-medium">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[80px] border-b border-r border-white/5 bg-white/[0.01]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = fmt(new Date(year, month, day))
              const isToday = dateStr === fmt(new Date())
              const rb = tab === 'rooms' ? bookingsOnDay(day) : []
              const vb = tab === 'venues' ? venuesOnDay(day) : []
              const count = rb.length + vb.length
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[80px] border-b border-r border-white/5 p-1.5 text-left hover:bg-white/5 transition-colors relative ${
                    selectedDate === dateStr ? 'bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30' : ''
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'bg-[var(--primary)] text-black w-6 h-6 rounded-full flex items-center justify-center' : 'text-white/60'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {rb.slice(0, 2).map(b => (
                      <div key={b.id} className={`text-[9px] px-1 py-0.5 rounded truncate text-white ${statusColors[b.status] || 'bg-blue-500/60'}`}>
                        {b.guest_name}
                      </div>
                    ))}
                    {vb.slice(0, 2).map(b => (
                      <div key={b.id} className={`text-[9px] px-1 py-0.5 rounded truncate text-white ${statusColors[b.status] || 'bg-purple-500/60'}`}>
                        {b.event_type}
                      </div>
                    ))}
                    {count > 2 && <div className="text-[9px] text-white/40">+{count - 2} more</div>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(statusColors).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1.5 text-white/40 capitalize">
            <span className={`w-2.5 h-2.5 rounded-sm ${c}`} />{s.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium text-sm">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {selRoomBookings.length === 0 && selVenueBookings.length === 0 && (
            <p className="text-white/30 text-sm">No bookings on this date</p>
          )}

          {selRoomBookings.map(b => {
            const room = rooms.find(r => r.id === b.room_id)
            return (
              <div key={b.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                <div>
                  <p className="text-white/90 text-sm font-medium">{b.guest_name} {b.guest_phone ? `• ${b.guest_phone}` : ''}</p>
                  <p className="text-white/40 text-xs">{room?.name || 'Room'} · {b.check_in} → {b.check_out}</p>
                  {b.notes && <p className="text-white/30 text-xs mt-0.5">{b.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize text-white ${statusColors[b.status]}`}>{b.status.replace('_', ' ')}</span>
                  {b.status === 'confirmed' && (
                    <button onClick={() => cancelBooking('room_bookings', b.id)} className="text-xs text-red-400 hover:underline">Cancel</button>
                  )}
                </div>
              </div>
            )
          })}

          {selVenueBookings.map(b => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
              <div>
                <p className="text-white/90 text-sm font-medium">{b.client_name} {b.client_phone ? `• ${b.client_phone}` : ''}</p>
                <p className="text-white/40 text-xs">{b.venue_name} · {b.event_type}</p>
                {b.notes && <p className="text-white/30 text-xs mt-0.5">{b.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize text-white ${statusColors[b.status]}`}>{b.status.replace('_', ' ')}</span>
                {b.status === 'confirmed' && (
                  <button onClick={() => cancelBooking('venue_bookings', b.id)} className="text-xs text-red-400 hover:underline">Cancel</button>
                )}
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
              <h2 className="text-white font-semibold">{tab === 'rooms' ? 'Add Room Booking' : 'Add Venue Booking'}</h2>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {tab === 'rooms' ? (
              <>
                <div>
                  <label className="text-white/40 text-xs">Room</label>
                  <select value={addForm.room_id} onChange={e => setAddForm(p => ({ ...p, room_id: e.target.value }))}
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1">
                    <option value="">Select room…</option>
                    {rooms.filter(r => r.status === 'available').map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                  </select>
                </div>
                <input value={addForm.guest_name} onChange={e => setAddForm(p => ({ ...p, guest_name: e.target.value }))} placeholder="Guest name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                <input value={addForm.guest_phone} onChange={e => setAddForm(p => ({ ...p, guest_phone: e.target.value }))} placeholder="Phone (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs">Check-in</label>
                    <input type="date" value={addForm.check_in} onChange={e => setAddForm(p => ({ ...p, check_in: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs">Check-out</label>
                    <input type="date" value={addForm.check_out} onChange={e => setAddForm(p => ({ ...p, check_out: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1" />
                  </div>
                </div>
                <input value={addForm.notes} onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
              </>
            ) : (
              <>
                <div>
                  <label className="text-white/40 text-xs">Venue</label>
                  <select value={venueForm.venue_name} onChange={e => setVenueForm(p => ({ ...p, venue_name: e.target.value }))}
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1">
                    <option>Grand Banquet Hall</option>
                    <option>Lawn & Garden</option>
                    <option>Terrace Deck</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs">Event Type</label>
                  <select value={venueForm.event_type} onChange={e => setVenueForm(p => ({ ...p, event_type: e.target.value }))}
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1">
                    {['Wedding','Reception','Birthday','Corporate Event','Engagement','Anniversary','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <input value={venueForm.client_name} onChange={e => setVenueForm(p => ({ ...p, client_name: e.target.value }))} placeholder="Client name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                <input value={venueForm.client_phone} onChange={e => setVenueForm(p => ({ ...p, client_phone: e.target.value }))} placeholder="Phone (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
                <div>
                  <label className="text-white/40 text-xs">Event Date</label>
                  <input type="date" value={venueForm.event_date} onChange={e => setVenueForm(p => ({ ...p, event_date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none mt-1" />
                </div>
                <input value={venueForm.notes} onChange={e => setVenueForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
              </>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
              <button onClick={tab === 'rooms' ? saveRoom : saveVenue} disabled={saving}
                className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
