'use client'

import { useState } from 'react'
import EditableImage from '@/components/EditableImage'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft, ArrowRight, Phone, Users, Maximize2, X, CheckCircle2, Loader2, CalendarDays } from 'lucide-react'
import { useSiteImages } from '@/lib/use-site-images'
import { useSiteConfig } from '@/lib/use-site-config'
import { submitEnquiry } from '@/lib/supabase-public'
import VenueChecker from '@/components/VenueChecker'

interface EventType { icon: string; title: string; desc: string }
interface Venue { name: string; capacity: string; size: string; features: string[] }
interface Stat  { value: string; label: string }

const DEFAULT_EVENTS: EventType[] = [
  { icon: '💒', title: 'Weddings', desc: 'Make your dream wedding a reality in our grand banquet hall with capacity for 500+ guests. Full catering, décor, and coordination.' },
  { icon: '🎂', title: 'Birthday Parties', desc: 'From intimate family gatherings to grand celebrations. Custom cake, decoration, DJ, and delicious food.' },
  { icon: '💼', title: 'Corporate Events', desc: 'Professional conference facilities with AV equipment, high-speed WiFi, catering, and accommodation for delegates.' },
  { icon: '🎓', title: 'Seminars & Workshops', desc: 'Fully equipped seminar halls for 50–500 participants. Projectors, sound systems, stationery included.' },
  { icon: '🙏', title: 'Religious Events', desc: 'Celebrate Satsang, Puja, Kirtan, and religious gatherings with authentic prasad catering.' },
  { icon: '👨‍👩‍👧‍👦', title: 'Family Functions', desc: 'Anniversaries, baby showers, retirement parties — we make every occasion special.' },
]

const DEFAULT_VENUES: Venue[] = [
  { name: 'Grand Banquet Hall', capacity: '500+ guests', size: '6000 sq ft', features: ['Stage & LED wall', 'AC', 'Full catering', 'Parking for 100 cars'] },
  { name: 'Lawn & Garden',      capacity: '500+ guests', size: '0.5 acres',  features: ['Open-air', 'Night lighting', 'Bar setup', 'Live music'] },
  { name: 'Conference Room',    capacity: '50 delegates', size: '1200 sq ft', features: ['Projector', 'Video conferencing', 'Whiteboard', 'Tea & coffee'] },
  { name: 'Private Dining Hall', capacity: '30 guests', size: '800 sq ft', features: ['Intimate setting', 'Customizable menu', 'Live cooking station'] },
]

const DEFAULT_STATS: Stat[] = [
  { value: '500+',      label: 'Guests Capacity' },
  { value: '6000 sq ft', label: 'Grand Hall' },
  { value: '15+',       label: 'Years Experience' },
  { value: '100s',      label: 'Events Hosted' },
]

function parseJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback
  try { return JSON.parse(str) as T } catch { return fallback }
}

export default function EventsPage() {
  const { images } = useSiteImages()
  const { config } = useSiteConfig()
  // enquiry modal state
  const [showEnquiry, setShowEnquiry] = useState(false)
  const [eForm, setEForm] = useState({ name: '', phone: '', email: '', eventType: 'Wedding', date: '', guests: '50' })
  const [eSending, setESending] = useState(false)
  const [eSent, setESent] = useState(false)
  const [eError, setEError] = useState('')

  const openEnquiry = () => { setShowEnquiry(true); setESent(false); setEError('') }
  const closeEnquiry = () => setShowEnquiry(false)

  const handleEnquiry = async () => {
    if (!eForm.name || eForm.phone.length < 10) {
      setEError('Please fill in your Name and Phone number (10 digits).'); return
    }
    setESending(true); setEError('')
    try {
      await submitEnquiry({
        name: eForm.name, phone: eForm.phone,
        email: eForm.email || undefined,
        enquiry_type: 'event',
        message: `Event: ${eForm.eventType}. Date: ${eForm.date || 'TBD'}. Guests: ${eForm.guests}.`,
        preferred_date: eForm.date || undefined,
        guests: Number(eForm.guests),
      })
      setESent(true)
    } catch (e) {
      setEError(e instanceof Error ? e.message : 'Failed to send. Please call us directly.')
    }
    setESending(false)
  }

  // Load dynamic data from site_config (admin-editable), fall back to defaults
  const events: EventType[] = parseJson(config.events_types,  DEFAULT_EVENTS)
  const venues: Venue[]     = parseJson(config.events_venues, DEFAULT_VENUES)
  // Stats: prefer individual admin-editable keys; fall back to events_stats JSON for legacy
  const statsRow: Stat[] = [
    { value: config.stat_guests_capacity  || DEFAULT_STATS[0].value, label: 'Guests Capacity' },
    { value: config.stat_hall_size        || DEFAULT_STATS[1].value, label: 'Grand Hall' },
    { value: config.stat_years_experience || DEFAULT_STATS[2].value, label: 'Years Experience' },
    { value: config.stat_events_hosted    || DEFAULT_STATS[3].value, label: 'Events Hosted' },
  ]

  // Map event titles to image keys (works for both default and custom titles)
  const EVENT_IMGS: Record<string, string> = {
    'Weddings':             images.eventWedding,
    'Birthday Parties':     images.eventBirthday,
    'Corporate Events':     images.eventCorporate,
    'Seminars & Workshops': images.eventSeminar,
    'Religious Events':     images.eventReligious,
    'Family Functions':     images.eventFamily,
  }

  const EVENT_KEYS: Record<string, string> = {
    'Weddings':             'eventWedding',
    'Birthday Parties':     'eventBirthday',
    'Corporate Events':     'eventCorporate',
    'Seminars & Workshops': 'eventSeminar',
    'Religious Events':     'eventReligious',
    'Family Functions':     'eventFamily',
  }

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative h-[65vh] min-h-[520px] flex items-end overflow-hidden">
          <EditableImage
            imageKey="heroEvents"
            src={images.heroEvents}
            alt="Events & Banquets" fill priority className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-14 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--primary)] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-2">Celebrate Life</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Events & Banquets</h1>
              <p className="text-white/55 text-lg max-w-xl mb-8">Creating unforgettable memories for every occasion — weddings, birthdays, corporate</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={openEnquiry} className="btn-gold">Get a Free Quote <ArrowRight className="w-4 h-4" /></button>
                <VenueChecker />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-[#0a0a1a] border-b border-white/[0.06] py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-8 justify-center sm:justify-start">
            {statsRow.map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-[var(--primary)] font-black text-xl">{value}</p>
                <p className="text-white/35 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* EVENT TYPES */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[var(--primary)] text-xs uppercase tracking-widest mb-3">What We Host</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Every Occasion, Perfectly Curated</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(e => (
                <div key={e.title} className="group rounded-3xl overflow-hidden glass hover:-translate-y-1 hover:border-[var(--primary)]/25 transition-all duration-300">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <EditableImage
                      imageKey={EVENT_KEYS[e.title] ?? 'heroEvents'}
                      src={EVENT_IMGS[e.title] || images.heroEvents}
                      alt={e.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-3xl">{e.icon}</span>
                      <h3 className="text-white font-bold text-lg mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>{e.title}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-white/45 text-sm leading-relaxed">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VENUES */}
        <section className="py-16 px-4 bg-[#0a0a1a]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[var(--primary)] text-xs uppercase tracking-widest mb-3">Spaces</p>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Our Venues</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.map(v => (
                <div key={v.name} className="glass rounded-2xl p-7 hover:border-[var(--primary)]/20 transition-all">
                  <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{v.name}</h3>
                  <div className="flex gap-4 mb-4">
                    <span className="flex items-center gap-1 text-[var(--primary)] text-sm"><Users className="w-3.5 h-3.5" />{v.capacity}</span>
                    <span className="flex items-center gap-1 text-white/40 text-sm"><Maximize2 className="w-3.5 h-3.5" />{v.size}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.features.map(f => (
                      <span key={f} className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/[0.06]">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-gold rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Plan Your Perfect Event</h2>
              <p className="text-white/50 mb-8">Get a free consultation and personalised quote for your occasion.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={openEnquiry} className="btn-gold">Get a Free Quote</button>
                <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="btn-outline"><Phone className="w-4 h-4" /> {config.phone}</a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── EVENT ENQUIRY MODAL ── */}
      {showEnquiry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) closeEnquiry() }}>
          <div className="bg-[#13131f] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <span className="text-lg">✨</span> Free Event Quote
              </h2>
              <button onClick={closeEnquiry} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {eSent ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                <h3 className="text-lg font-bold text-green-400">Enquiry Sent!</h3>
                <p className="text-white/50 text-sm">
                  Thank you, <strong className="text-white">{eForm.name}</strong>!<br />
                  Our events team will call you at <strong className="text-white">{eForm.phone}</strong> within 2–4 hours with a personalised quote.
                  {eForm.email && <><br /><span className="text-white/40 text-xs mt-1 block">A confirmation email will be sent to <strong className="text-white/70">{eForm.email}</strong></span></>}
                </p>
                <button onClick={closeEnquiry}
                  className="px-6 py-2.5 bg-[var(--primary)] text-black rounded-xl font-bold text-sm hover:opacity-90">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Full Name *</label>
                    <input value={eForm.name} onChange={e => setEForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[var(--primary)]/40" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Phone Number * (10 digits)</label>
                    <input type="tel" inputMode="numeric" value={eForm.phone}
                      onChange={e => setEForm(p => ({ ...p, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                      placeholder="9876543210" maxLength={10}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[var(--primary)]/40 font-mono tracking-wider" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Email Address <span className="text-white/20">(optional — for confirmation email)</span></label>
                    <input type="email" value={eForm.email}
                      onChange={e => setEForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[var(--primary)]/40" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Event Type</label>
                      <select value={eForm.eventType} onChange={e => setEForm(p => ({ ...p, eventType: e.target.value }))}
                        className="w-full bg-[#13131f] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[var(--primary)]/40">
                        {['Wedding','Birthday','Corporate','Seminar','Religious','Family Function','Other'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Approx. Guests</label>
                      <select value={eForm.guests} onChange={e => setEForm(p => ({ ...p, guests: e.target.value }))}
                        className="w-full bg-[#13131f] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[var(--primary)]/40">
                        {['25','50','100','200','300','500','500+'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Preferred Date (optional)</label>
                    <input type="date" value={eForm.date}
                      onChange={e => setEForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[var(--primary)]/40" />
                  </div>
                </div>
                {eError && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{eError}</p>
                )}
                <button onClick={handleEnquiry} disabled={eSending}
                  className="w-full py-3 bg-[var(--primary)] text-black rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {eSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Get My Free Quote'}
                </button>
                <p className="text-white/20 text-xs text-center">100% free consultation. No obligation.</p>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
