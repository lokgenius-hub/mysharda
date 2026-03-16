'use client'

import Image from 'next/image'
import EditableImage from '@/components/EditableImage'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft, ArrowRight, Phone, Users, Maximize2 } from 'lucide-react'
import { useSiteImages } from '@/lib/use-site-images'
import { useSiteConfig } from '@/lib/use-site-config'
import VenueChecker from '@/components/VenueChecker'

const events = [
  { icon: '💒', title: 'Weddings', desc: 'Make your dream wedding a reality in our grand banquet hall with capacity for 500+ guests. Full catering, décor, and coordination.' },
  { icon: '🎂', title: 'Birthday Parties', desc: 'From intimate family gatherings to grand celebrations. Custom cake, decoration, DJ, and delicious food.' },
  { icon: '💼', title: 'Corporate Events', desc: 'Professional conference facilities with AV equipment, high-speed WiFi, catering, and accommodation for delegates.' },
  { icon: '🎓', title: 'Seminars & Workshops', desc: 'Fully equipped seminar halls for 50–500 participants. Projectors, sound systems, stationery included.' },
  { icon: '🙏', title: 'Religious Events', desc: 'Celebrate Satsang, Puja, Kirtan, and religious gatherings with authentic prasad catering.' },
  { icon: '👨‍👩‍👧‍👦', title: 'Family Functions', desc: 'Anniversaries, baby showers, retirement parties — we make every occasion special.' },
]

const venues = [
  { name: 'Grand Banquet Hall', capacity: '500+ guests', size: '6000 sq ft', features: ['Stage & LED wall', 'AC', 'Full catering', 'Parking for 100 cars'] },
  { name: 'Lawn & Garden', capacity: '500+ guests', size: '0.5 acres', features: ['Open-air', 'Night lighting', 'Bar setup', 'Live music'] },
  { name: 'Conference Room', capacity: '50 delegates', size: '1200 sq ft', features: ['Projector', 'Video conferencing', 'Whiteboard', 'Tea & coffee'] },
  { name: 'Private Dining Hall', capacity: '30 guests', size: '800 sq ft', features: ['Intimate setting', 'Customizable menu', 'Live cooking station'] },
]

export default function EventsPage() {
  const { images } = useSiteImages()
  const { config } = useSiteConfig()

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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-14 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#c9a84c] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">Celebrate Life</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Events & Banquets</h1>
              <p className="text-white/55 text-lg max-w-xl mb-8">Creating unforgettable memories for every occasion — weddings, birthdays, corporate</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact?type=event" className="btn-gold">Get a Free Quote <ArrowRight className="w-4 h-4" /></Link>
                <VenueChecker />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-[#0a0a1a] border-b border-white/[0.06] py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-8 justify-center sm:justify-start">
            {[['500+','Guests Capacity'],['6000 sq ft','Grand Hall'],['15+','Years Experience'],['100s','Events Hosted']].map(([val,lbl]) => (
              <div key={lbl} className="text-center sm:text-left">
                <p className="text-[#c9a84c] font-black text-xl">{val}</p>
                <p className="text-white/35 text-xs">{lbl}</p>
              </div>
            ))}
          </div>
        </section>

        {/* EVENT TYPES */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#c9a84c] text-xs uppercase tracking-widest mb-3">What We Host</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Every Occasion, Perfectly Curated</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(e => (
                <div key={e.title} className="group rounded-3xl overflow-hidden glass hover:-translate-y-1 hover:border-[#c9a84c]/25 transition-all duration-300">
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
              <p className="text-[#c9a84c] text-xs uppercase tracking-widest mb-3">Spaces</p>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Our Venues</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.map(v => (
                <div key={v.name} className="glass rounded-2xl p-7 hover:border-[#c9a84c]/20 transition-all">
                  <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{v.name}</h3>
                  <div className="flex gap-4 mb-4">
                    <span className="flex items-center gap-1 text-[#c9a84c] text-sm"><Users className="w-3.5 h-3.5" />{v.capacity}</span>
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
                <Link href="/contact?type=event" className="btn-gold">Get a Free Quote</Link>
                <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="btn-outline"><Phone className="w-4 h-4" /> {config.phone}</a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
