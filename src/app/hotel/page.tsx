'use client'
import { useState, useEffect } from 'react'
import { getPublicRooms } from '@/lib/supabase-public'
import { useSiteImages } from '@/lib/use-site-images'
import { useSiteConfig } from '@/lib/use-site-config'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AvailabilityChecker from '@/components/AvailabilityChecker'
import { Bed, Users, Wifi, Tv, Wind, ChevronLeft, Phone, ArrowRight, Check } from 'lucide-react'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3.5 h-3.5" />,
  tv:   <Tv className="w-3.5 h-3.5" />,
  ac:   <Wind className="w-3.5 h-3.5" />,
}

const TYPES = ['Standard','Deluxe','Suite']

type Room = { id: string; name: string; type: string; capacity: number; price_per_night: number; status: string; amenities?: string[]; image_url?: string }

export default function HotelPage() {
  const { images } = useSiteImages()
  const { config } = useSiteConfig()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicRooms()
      .then(data => setRooms(data as Room[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const ROOM_IMAGES: Record<string, string> = {
    Standard: images.roomStandard,
    Deluxe:   images.roomDeluxe,
    Suite:    images.roomSuite,
  }

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
          <Image
            src={images.heroHotel}
            alt="Sharda Palace Hotel" fill priority className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-black/40 to-black/20" />
          <div className="relative z-10 w-full pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#c9a84c] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">Luxury Accommodation</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Hotel & Rooms</h1>
              <p className="text-white/50 text-lg mt-3 max-w-xl">Experience divine comfort in elegantly furnished rooms and suites</p>
              <div className="mt-6">
                <AvailabilityChecker rooms={rooms} />
              </div>
            </div>
          </div>
        </section>

        {/* AMENITIES BAR */}
        <section className="bg-[#0a0a1a] border-b border-white/[0.06] py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-6 justify-center sm:justify-start">
            {[['🌐','Free Wi-Fi'],['❄️','Air Conditioned'],['📺','LED TV'],['🍳','Room Service'],['🅿️','Free Parking'],['☕','Complimentary Breakfast']].map(([ic,lb]) => (
              <div key={lb} className="flex items-center gap-2 text-white/50 text-sm">
                <span>{ic}</span> {lb}
              </div>
            ))}
          </div>
        </section>

        {/* ROOMS BY TYPE */}
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/30">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-32 text-center text-white/30">
            <Bed className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Rooms coming soon</p>
            <p className="text-sm mt-2">Add rooms from the Admin panel</p>
          </div>
        ) : (
          TYPES.map(type => {
            const typeRooms = rooms.filter(r => r.type === type)
            if (!typeRooms.length) return null
            const fallbackImg = ROOM_IMAGES[type] || ROOM_IMAGES.Standard
            return (
              <section key={type} className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center gap-4 mb-10">
                    <div>
                      <p className="text-[#c9a84c] text-xs uppercase tracking-widest mb-1">{type === 'Suite' ? 'Premium' : type === 'Deluxe' ? 'Popular' : 'Comfortable'}</p>
                      <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{type} Rooms</h2>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/20 to-transparent ml-4" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typeRooms.map((room) => (
                      <div key={room.id} className="group rounded-3xl overflow-hidden glass hover:border-[#c9a84c]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c9a84c]/5">
                        <div className="aspect-[16/10] relative overflow-hidden">
                          <Image
                            src={room.image_url || fallbackImg}
                            alt={room.name} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${room.status === 'available' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                            {room.status === 'available' ? '● Available' : '● Occupied'}
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-[#c9a84c]/90 text-black text-xs font-bold rounded-full">{type}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{room.name}</h3>
                            <div className="flex items-center gap-1 text-white/40 text-sm">
                              <Users className="w-3.5 h-3.5" /> {room.capacity}
                            </div>
                          </div>
                          {(Array.isArray(room.amenities) ? room.amenities : []).slice(0,5).map((a: string) => (
                            <span key={a} className="inline-flex items-center gap-1 text-white/35 text-xs mr-3 mb-1">
                              {AMENITY_ICONS[a.toLowerCase()] ?? <Check className="w-3 h-3" />} {a}
                            </span>
                          ))}
                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
                            <div>
                              <p className="text-[#c9a84c] font-black text-2xl">₹{Number(room.price_per_night).toLocaleString()}</p>
                              <p className="text-white/30 text-xs">per night + taxes</p>
                            </div>
                            <Link href="/contact?type=hotel" className="btn-gold text-xs px-4 py-2">
                              Book Now <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          })
        )}

        {/* CTA */}
        <section className="py-20 px-4 bg-[#0a0a1a]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-gold rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Need Help Choosing a Room?</h2>
              <p className="text-white/50 mb-8">Call us directly for the best rates, seasonal offers, and special packages.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="btn-gold"><Phone className="w-4 h-4" /> {config.phone}</a>
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
