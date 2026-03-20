'use client'
import { useState, useEffect } from 'react'
import { getPublicRooms } from '@/lib/supabase-public'
import { useSiteImages } from '@/lib/use-site-images'
import { useSiteConfig } from '@/lib/use-site-config'
import EditableImage from '@/components/EditableImage'
import EditableText from '@/components/EditableText'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Bed, Users, Wifi, Tv, Wind, ChevronLeft, Phone, ArrowRight, Check, Star } from 'lucide-react'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3.5 h-3.5" />,
  tv:   <Tv className="w-3.5 h-3.5" />,
  ac:   <Wind className="w-3.5 h-3.5" />,
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  Standard:   { label: 'Best Value',   color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  Deluxe:     { label: 'Most Popular', color: 'bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30' },
  Suite:      { label: 'Premium',      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  Banquet:    { label: 'Events',       color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  Conference: { label: 'Business',     color: 'bg-green-500/20 text-green-300 border-green-500/30' },
}

type Room = { id: string; name: string; type: string; capacity: number; price_per_night: number; status: string; amenities?: string[] }

export default function HotelPage() {
  const { images } = useSiteImages()
  const { config } = useSiteConfig()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicRooms().then(d => setRooms(d as Room[])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const typeImage = (type: string) => images[`room${type}`] || images.roomStandard

  const types = [...new Set(rooms.map(r => r.type))].sort((a, b) => {
    const minA = Math.min(...rooms.filter(r => r.type === a).map(r => r.price_per_night))
    const minB = Math.min(...rooms.filter(r => r.type === b).map(r => r.price_per_night))
    return minA - minB
  })

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative h-[65vh] min-h-[500px] flex items-end overflow-hidden">
          <EditableImage imageKey="heroHotel" src={images.heroHotel} alt="Sharda Palace Hotel" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-black/40 to-black/10" />
          <div className="relative z-10 w-full pb-14 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-[var(--primary)] text-sm mb-5 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Home
              </Link>
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-2">Luxury Accommodation</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Hotel &amp; Rooms</h1>
              <p className="text-white/50 text-base mt-3 max-w-lg">
                <EditableText configKey="hotel_tagline" value={config.hotel_tagline}><span>{config.hotel_tagline || 'Elegantly furnished rooms and suites — every stay a royal experience'}</span></EditableText>
              </p>
            </div>
          </div>
        </section>

        {/* AMENITIES STRIP */}
        <section className="bg-[#0a0a1a] border-b border-white/[0.05] py-4 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-5 justify-center sm:justify-start">
            {[['🌐','Free Wi-Fi'],['❄️','Air Conditioned'],['📺','LED TV'],['🍳','Room Service'],['🅿️','Free Parking'],['☕','Breakfast']].map(([ic,lb]) => (
              <div key={lb} className="flex items-center gap-1.5 text-white/45 text-xs"><span>{ic}</span><span>{lb}</span></div>
            ))}
          </div>
        </section>

        {/* ROOM CATEGORIES */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-3">Our Rooms</p>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Choose Your Stay</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                <p className="text-white/30 text-sm">Loading rooms…</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="py-24 text-center text-white/30">
                <Bed className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="text-xl">Rooms coming soon</p>
              </div>
            ) : (
              <div className="space-y-8">
                {types.map((type, idx) => {
                  const typeRooms = rooms.filter(r => r.type === type)
                  const available = typeRooms.filter(r => r.status === 'available').length
                  const minPrice  = Math.min(...typeRooms.map(r => r.price_per_night))
                  const maxPrice  = Math.max(...typeRooms.map(r => r.price_per_night))
                  const badge     = TYPE_BADGES[type] ?? { label: 'Available', color: 'bg-white/10 text-white/60 border-white/15' }
                  const amenities = [...new Set(typeRooms.flatMap(r => r.amenities ?? []))].slice(0, 6)
                  const maxCap    = Math.max(...typeRooms.map(r => r.capacity))
                  const imgKey    = `room${type}`
                  const flip      = idx % 2 === 1

                  return (
                    <div key={type} className={`group grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/[0.06] hover:border-[var(--primary)]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--primary)]/5`}>
                      {/* Image column — flip on odd rows on lg */}
                      <div className={`relative aspect-[16/10] lg:aspect-auto min-h-[280px] overflow-hidden ${flip ? 'lg:order-2' : ''}`}>
                        <EditableImage imageKey={imgKey} src={typeImage(type)} alt={`${type} Room`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${badge.color}`}>{badge.label}</div>
                        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${available > 0 ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-red-500/15 border-red-500/25 text-red-300'}`}>
                          {available > 0 ? `${available} room${available !== 1 ? 's' : ''} available` : 'Currently full'}
                        </div>
                      </div>

                      {/* Info column */}
                      <div className={`p-8 lg:p-10 flex flex-col justify-center bg-[#0d0d20] ${flip ? 'lg:order-1' : ''}`}>
                        <p className="text-[var(--primary)] text-[10px] uppercase tracking-[0.2em] mb-1">{type} Category</p>
                        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{type} Rooms</h3>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_,i) => <Star key={i} className="w-3.5 h-3.5 text-[var(--primary)] fill-[var(--primary)]" />)}
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40 text-sm mb-5">
                          <Users className="w-4 h-4" /><span>Up to {maxCap} guest{maxCap !== 1 ? 's' : ''}</span>
                        </div>
                        {amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-5">
                            {amenities.map(a => (
                              <span key={a} className="inline-flex items-center gap-1 text-white/40 text-xs bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                                {AMENITY_ICONS[a.toLowerCase()] ?? <Check className="w-3 h-3" />}{a}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {typeRooms.map(r => (
                            <span key={r.id} className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${r.status === 'available' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/[0.03] border-white/[0.06] text-white/25'}`}>
                              {r.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-end justify-between pt-5 border-t border-white/[0.06]">
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-[var(--primary)]" style={{ fontFamily: 'Playfair Display, serif' }}>₹{Number(minPrice).toLocaleString()}</span>
                              {maxPrice !== minPrice && <span className="text-white/30 text-sm">– ₹{Number(maxPrice).toLocaleString()}</span>}
                            </div>
                            <p className="text-white/25 text-xs mt-0.5">per night + taxes</p>
                          </div>
                          <Link href="/contact?type=hotel" className="btn-gold text-xs px-5 py-2.5">Book Now <ArrowRight className="w-3.5 h-3.5" /></Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-[#0a0a1a]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-gold rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Need Help Choosing?</h2>
              <p className="text-white/50 mb-8">Call us directly for the best rates, seasonal offers, and special packages.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href={`tel:${config.phone.replace(/\s/g,'')}`} className="btn-gold"><Phone className="w-4 h-4" /> {config.phone}</a>
                <Link href="/contact" className="btn-outline">Send Enquiry</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}