'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X, Check, MapPin, Users } from 'lucide-react'
import { getPublicVenueBookings } from '@/lib/supabase-public'

const VENUES = [
  { id: 'Sharda Banquet Hall', label: 'Grand Banquet Hall', icon: '🏛️', capacity: '500+ guests', note: 'AC · Stage · Catering' },
  { id: 'Garden Lawn',         label: 'Lawn & Garden',      icon: '🌿', capacity: '500+ guests', note: 'Open-air · Night lighting' },
  { id: 'Terrace Deck',        label: 'Terrace Deck',       icon: '✨', capacity: 'Up to 100',    note: 'Intimate · Rooftop views' },
]

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_S  = ['S','M','T','W','T','F','S']

function fmt(d: Date) { return d.toISOString().split('T')[0] }

interface VenueBooking { venue_name: string; event_date: string }

export default function VenueChecker() {
  const [open, setOpen]           = useState(false)
  const [venue, setVenue]         = useState<string | null>(null)
  const [year, setYear]           = useState(new Date().getFullYear())
  const [month, setMonth]         = useState(new Date().getMonth())
  const [selectedDate, setDate]   = useState<string | null>(null)
  const [bookings, setBookings]   = useState<VenueBooking[]>([])
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<'available' | 'booked' | null>(null)

  const firstDay    = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startPad    = firstDay.getDay()
  const todayStr    = fmt(new Date())

  const from = fmt(new Date(year, month, 1))
  const to   = fmt(new Date(year, month + 1, 0))

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPublicVenueBookings(from, to)
      setBookings(data as VenueBooking[])
    } catch { /* empty */ }
    setLoading(false)
  }, [from, to])

  useEffect(() => { if (open) loadBookings() }, [open, loadBookings])

  function close() {
    setOpen(false); setVenue(null); setDate(null); setResult(null)
  }

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  function pickDate(day: number) {
    const d = fmt(new Date(year, month, day))
    if (d < todayStr) return
    setDate(d)
    setResult(null)
  }

  function isVenueBooked(day: number) {
    if (!venue) return false
    const d = fmt(new Date(year, month, day))
    return bookings.some(b => b.venue_name === venue && b.event_date === d)
  }

  function check() {
    if (!venue || !selectedDate) return
    const booked = bookings.some(b => b.venue_name === venue && b.event_date === selectedDate)
    setResult(booked ? 'booked' : 'available')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-gold text-sm"
      >
        <Calendar className="w-4 h-4" /> Check Venue Availability
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#141428] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#141428] z-10">
          <h2 className="text-white font-bold text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Calendar className="w-5 h-5 text-[#c9a84c]" /> Check Venue Availability
          </h2>
          <button onClick={close} className="text-white/30 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Step 1 — pick venue */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Step 1 — Select Venue</p>
            <div className="space-y-2">
              {VENUES.map(v => (
                <button
                  key={v.id}
                  onClick={() => { setVenue(v.id); setResult(null) }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    venue === v.id
                      ? 'border-[#c9a84c]/40 bg-[#c9a84c]/8'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                  }`}
                >
                  <span className="text-2xl">{v.icon}</span>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm font-medium">{v.label}</p>
                    <p className="text-white/35 text-xs">{v.note}</p>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1 text-[#c9a84c] text-xs">
                      <Users className="w-3 h-3" /> {v.capacity}
                    </span>
                  </div>
                  {venue === v.id && <Check className="w-4 h-4 text-[#c9a84c]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — pick date */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Step 2 — Select Event Date</p>

            {/* Selected date display */}
            <div className={`p-3 rounded-xl border text-center mb-3 ${selectedDate ? 'border-[#c9a84c]/30 bg-[#c9a84c]/5' : 'border-white/10 bg-white/[0.02]'}`}>
              <p className="text-white/40 text-xs mb-0.5">Event Date</p>
              <p className="text-white font-medium text-sm">
                {selectedDate
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Select a date below'
                }
              </p>
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-2">
              <button onClick={prev} className="text-white/40 hover:text-white p-1"><ChevronLeft className="w-4 h-4" /></button>
              <p className="text-white font-medium text-sm">{MONTHS[month]} {year}</p>
              <button onClick={next} className="text-white/40 hover:text-white p-1"><ChevronRight className="w-4 h-4" /></button>
            </div>

            {loading ? (
              <div className="text-center text-white/30 py-6 text-sm">Loading...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {DAYS_S.map((d, i) => (
                  <div key={`h-${i}`} className="text-center text-white/30 text-[10px] py-1">{d}</div>
                ))}
                {Array.from({ length: startPad }).map((_, i) => <div key={`p-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day     = i + 1
                  const dateStr = fmt(new Date(year, month, day))
                  const isPast  = dateStr < todayStr
                  const isToday = dateStr === todayStr
                  const isSel   = dateStr === selectedDate
                  const booked  = venue ? isVenueBooked(day) : false

                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      onClick={() => pickDate(day)}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs transition-all relative
                        ${isPast        ? 'text-white/15 cursor-not-allowed' : ''}
                        ${isSel         ? 'bg-[#c9a84c] text-black font-bold' : ''}
                        ${booked && !isSel ? 'bg-red-500/15 text-red-400/60 cursor-pointer' : ''}
                        ${!isPast && !isSel && !booked ? 'text-white/70 hover:bg-white/10' : ''}
                        ${isToday && !isSel ? 'ring-1 ring-[#c9a84c]/40' : ''}
                      `}
                    >
                      {day}
                      {booked && !isSel && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400/60" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            {venue && (
              <p className="text-white/25 text-[10px] mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400/60 inline-block" /> Red dot = already booked date for this venue
              </p>
            )}
          </div>

          {/* Check button */}
          <button
            onClick={check}
            disabled={!venue || !selectedDate}
            className="w-full py-3 bg-[#c9a84c] hover:bg-[#d4af5a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-sm"
          >
            {venue && selectedDate ? 'Check Availability' : 'Select venue and date above'}
          </button>

          {/* Result */}
          {result === 'available' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <Check className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-green-400 font-semibold text-sm">Venue Available!</p>
                <p className="text-white/50 text-xs mt-1">
                  {VENUES.find(v => v.id === venue)?.label} appears to be available on{' '}
                  {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  Contact us to confirm your booking.
                </p>
                <a
                  href="/contact?type=event"
                  className="inline-flex items-center gap-1 mt-2 text-[#c9a84c] text-xs font-semibold hover:underline"
                >
                  <MapPin className="w-3 h-3" /> Book this venue →
                </a>
              </div>
            </div>
          )}
          {result === 'booked' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 font-semibold text-sm">Already Booked</p>
                <p className="text-white/50 text-xs mt-1">
                  {VENUES.find(v => v.id === venue)?.label} is already booked on this date.
                  Please try a different date or another venue.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
