import { getPublicRooms } from '@/lib/supabase-public'
import Image from 'next/image'
import Link from 'next/link'
import { Bed, Users, Star, Wifi, Tv, Wind } from 'lucide-react'

export const metadata = { title: 'Hotel Rooms | Sharda Palace', description: 'Luxurious rooms and suites at Sharda Palace, Vrindavan. Book now for the best rates.' }

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3.5 h-3.5" />, tv: <Tv className="w-3.5 h-3.5" />, ac: <Wind className="w-3.5 h-3.5" />
}

export default async function HotelPage() {
  const rooms = await getPublicRooms()
  const types = ['Standard', 'Deluxe', 'Suite']

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-b from-black to-[#0f0f23] text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c9a84c 0%, transparent 60%)' }} />
        <div className="relative container mx-auto px-4">
          <p className="text-[#c9a84c] text-sm tracking-[0.3em] uppercase mb-3">Luxury Stays</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Hotel & Rooms</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Experience divine comfort in our elegantly furnished rooms and suites</p>
        </div>
      </section>

      {/* Rooms by type */}
      {types.map(type => {
        const typeRooms = rooms.filter((r: Record<string,string>) => r.type === type)
        if (!typeRooms.length) return null
        return (
          <section key={type} className="py-16 container mx-auto px-4">
            <h2 className="text-2xl font-serif font-bold text-white mb-8">{type} Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typeRooms.map((room: Record<string,string|number|boolean>) => (
                <div key={room.id as string} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-[#c9a84c]/20 transition-all group">
                  <div className="aspect-video bg-gradient-to-br from-[#c9a84c]/10 to-transparent relative flex items-center justify-center">
                    {room.image_url ? (
                      <Image src={room.image_url as string} alt={room.name as string} fill className="object-cover" />
                    ) : (
                      <Bed className="w-12 h-12 text-[#c9a84c]/30" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${room.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {room.status === 'available' ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-semibold text-lg mb-1">{room.name}</h3>
                    <div className="flex items-center gap-3 text-white/40 text-sm mb-3">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{room.capacity} Guests</span>
                    </div>
                    {room.amenities && (Array.isArray(room.amenities) ? (room.amenities as string[]) : []).slice(0, 4).map((a: string) => (
                      <span key={a} className="inline-flex items-center gap-1 text-white/30 text-xs mr-2 mb-1">
                        {AMENITY_ICONS[a.toLowerCase()] ?? null} {a}
                      </span>
                    ))}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[#c9a84c] font-bold text-xl">₹{Number(room.price_per_night).toLocaleString()}<span className="text-sm text-white/30 font-normal">/night</span></p>
                      <Link href="/contact?type=hotel" className="px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">Book Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* CTA */}
      <section className="py-16 text-center bg-gradient-to-b from-[#0f0f23] to-black">
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Need Help Booking?</h2>
        <p className="text-white/50 mb-6">Call us directly for best rates and special packages</p>
        <a href={`tel:${process.env.NEXT_PUBLIC_HOTEL_PHONE}`} className="inline-flex items-center gap-2 px-8 py-3 bg-[#c9a84c] text-black rounded-xl font-semibold hover:bg-[#d4af5a] transition-colors text-lg">
          📞 {process.env.NEXT_PUBLIC_HOTEL_PHONE}
        </a>
      </section>
    </main>
  )
}
