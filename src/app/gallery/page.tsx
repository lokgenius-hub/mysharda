import { getPublicGallery } from '@/lib/supabase-public'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'Gallery | Sharda Palace', description: 'Photo gallery of Sharda Palace — hotel rooms, restaurant, events, and amenities.' }

const FALLBACK_IMAGES = [
  { id:'f1', url:'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', alt:'Hotel Lobby', category:'Hotel' },
  { id:'f2', url:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', alt:'Standard Room', category:'Rooms' },
  { id:'f3', url:'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80', alt:'Deluxe Room', category:'Rooms' },
  { id:'f4', url:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', alt:'Restaurant', category:'Restaurant' },
  { id:'f5', url:'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', alt:'Banquet Hall', category:'Events' },
  { id:'f6', url:'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80', alt:'Taj Mahal Tour', category:'Travel' },
  { id:'f7', url:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', alt:'Suite', category:'Rooms' },
  { id:'f8', url:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', alt:'Dining Area', category:'Restaurant' },
  { id:'f9', url:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80', alt:'Mathura Temple', category:'Travel' },
  { id:'f10', url:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', alt:'North Indian Thali', category:'Food' },
  { id:'f11', url:'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', alt:'Wedding Ceremony', category:'Events' },
  { id:'f12', url:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', alt:'Vegetarian Cuisine', category:'Food' },
]

export default async function GalleryPage() {
  const rawImages = await getPublicGallery().catch(() => [])
  const images = rawImages.length > 0
    ? (rawImages as Array<{id:string;url:string;alt?:string;category?:string}>)
    : FALLBACK_IMAGES

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative h-[55vh] min-h-[460px] flex items-end overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80"
            alt="Sharda Palace Gallery" fill priority className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#c9a84c] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">Visual Journey</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Gallery</h1>
              <p className="text-white/50 text-lg mt-3">Glimpses of luxury, warmth, and unforgettable moments</p>
            </div>
          </div>
        </section>

        {/* GRID */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map(img => (
                <div key={img.id} className="break-inside-avoid rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#c9a84c]/25 transition-all group relative">
                  <div className="relative">
                    <Image
                      src={img.url}
                      alt={img.alt ?? 'Sharda Palace'}
                      width={400} height={300}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {img.category && (
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="px-2.5 py-1 rounded-full bg-[#c9a84c]/90 text-black text-xs font-semibold">{img.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
