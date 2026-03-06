'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X, Check, Bed, Users } from 'lucide-react'
import { getPublicBookings } from '@/lib/supabase-public'

interface Room {
  id: string; name: string; type: string; capacity: number; price_per_night: number; status: string
}
interface Booking {
  room_id: string; check_in: string; check_out: string; status: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_S = ['S','M','T','W','T','F','S']

function fmt(d: Date) { return d.toISOString().split('T')[0] }

export default function AvailabilityChecker({ rooms }: { rooms: Room[] }) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Room[] | null>(null)

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startPad = firstDay.getDay()
  const todayStr = fmt(new Date())

  const from = fmt(new Date(year, month, 1))
  const to = fmt(new Date(year, month + 2, 0)) // load 2 months ahead

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPublicBookings(from, to)
      setBookings(data as Booking[])
    } catch { /* empty */ }
    setLoading(false)
  }, [from, to])

  useEffect(() => {
    if (open) loadBookings()
  }, [open, loadBookings])

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  function selectDate(day: number) {
    const d = fmt(new Date(year, month, day))
    if (d < todayStr) return

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(d)
      setCheckOut(null)
      setResults(null)
    } else {
      if (d <= checkIn) {
        setCheckIn(d)
      } else {
        setCheckOut(d)
      }
    }
  }

  function search() {
    if (!checkIn || !checkOut) return
    // Find rooms not booked in the selected range
    const bookedRoomIds = new Set(
      bookings
        .filter(b => b.status !== 'cancelled' && b.check_in < checkOut && b.check_out > checkIn)
        .map(b => b.room_id)
    )
    const available = rooms.filter(r => r.status === 'available' && !bookedRoomIds.has(r.id))
    setResults(available)
  }

  function isInRange(day: number) {
    if (!checkIn || !checkOut) return false
    const d = fmt(new Date(year, month, day))
    return d >= checkIn && d <= checkOut
  }

  function isBookedDay(day: number) {
    const d = fmt(new Date(year, month, day))
    const availableRooms = rooms.filter(r => r.status === 'available').length
    if (availableRooms === 0) return false // no room data yet — don't block calendar
    const bookedCount = bookings.filter(b => b.status !== 'cancelled' && b.check_in <= d && b.check_out > d).length
    return bookedCount >= availableRooms
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-gold text-sm"
      >
        <Calendar className="w-4 h-4" /> Check Availability
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#141428] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Calendar className="w-5 h-5 text-[#c9a84c]" /> Check Room Availability
          </h2>
          <button onClick={() => { setOpen(false); setResults(null); setCheckIn(null); setCheckOut(null) }} className="text-white/30 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selected dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border text-center ${checkIn ? 'border-[#c9a84c]/30 bg-[#c9a84c]/5' : 'border-white/10 bg-white/[0.02]'}`}>
              <p className="text-white/40 text-xs mb-0.5">Check-in</p>
              <p className="text-white font-medium text-sm">{checkIn || 'Select date'}</p>
            </div>
            <div className={`p-3 rounded-xl border text-center ${checkOut ? 'border-[#c9a84c]/30 bg-[#c9a84c]/5' : 'border-white/10 bg-white/[0.02]'}`}>
              <p className="text-white/40 text-xs mb-0.5">Check-out</p>
              <p className="text-white font-medium text-sm">{checkOut || 'Select date'}</p>
            </div>
          </div>

          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={prev} className="text-white/40 hover:text-white p-1"><ChevronLeft className="w-4 h-4" /></button>
            <p className="text-white font-medium text-sm">{MONTHS[month]} {year}</p>
            <button onClick={next} className="text-white/40 hover:text-white p-1"><ChevronRight className="w-4 h-4" /></button>
          </div>

          {/* Calendar mini */}
          {loading ? (
            <div className="text-center text-white/30 py-8 text-sm">Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {DAYS_S.map((d, i) => (
                <div key={`h-${i}`} className="text-center text-white/30 text-[10px] py-1">{d}</div>
              ))}
              {Array.from({ length: startPad }).map((_, i) => <div key={`p-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = fmt(new Date(year, month, day))
                const isPast = dateStr < todayStr
                const isToday = dateStr === todayStr
                const isStart = dateStr === checkIn
                const isEnd = dateStr === checkOut
                const inRange = isInRange(day)
                const fullyBooked = isBookedDay(day)

                return (
                  <button
                    key={day}
                    disabled={isPast || fullyBooked}
                    onClick={() => selectDate(day)}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs transition-all
                      ${isPast ? 'text-white/15 cursor-not-allowed' : ''}
                      ${fullyBooked && !isPast ? 'text-red-400/50 line-through cursor-not-allowed' : ''}
                      ${isStart || isEnd ? 'bg-[#c9a84c] text-black font-bold' : ''}
                      ${inRange && !isStart && !isEnd ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : ''}
                      ${!isPast && !fullyBooked && !isStart && !isEnd && !inRange ? 'text-white/70 hover:bg-white/10' : ''}
                      ${isToday && !isStart && !isEnd ? 'ring-1 ring-[#c9a84c]/40' : ''}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          )}

          {/* Search button */}
          <button
            onClick={search}
            disabled={!checkIn || !checkOut}
            className="w-full py-3 bg-[#c9a84c] hover:bg-[#d4af5a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-sm"
          >
            {checkIn && checkOut
              ? `Search Available Rooms (${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)} nights)`
              : 'Select check-in & check-out dates'
            }
          </button>

          {/* Results */}
          {results !== null && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-red-400/70 text-sm text-center py-3">No rooms available for these dates. Try different dates.</p>
              ) : (
                <>
                  <p className="text-green-400/80 text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> {results.length} room{results.length !== 1 ? 's' : ''} available</p>
                  {results.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-[#c9a84c]" />
                        <div>
                          <p className="text-white/90 text-sm font-medium">{r.name}</p>
                          <p className="text-white/40 text-xs">{r.type} · <Users className="w-3 h-3 inline" /> {r.capacity}</p>
                        </div>
                      </div>
                      <p className="text-[#c9a84c] font-bold text-sm">₹{r.price_per_night.toLocaleString()}<span className="text-white/30 text-xs font-normal">/night</span></p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
