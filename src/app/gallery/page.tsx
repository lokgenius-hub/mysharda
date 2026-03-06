'use client'

import { useState, useEffect } from 'react'
import { getPublicGallery } from '@/lib/supabase-public'
import { useSiteImages } from '@/lib/use-site-images'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft } from 'lucide-react'

type GalleryImage = { id: string; url: string; alt?: string; category?: string; image_key?: string }

const GALLERY_FALLBACK_META: Record<string, { alt: string; category: string }> = {
  gallery1:  { alt: 'Hotel Lobby',        category: 'Hotel' },
  gallery2:  { alt: 'Standard Room',      category: 'Rooms' },
  gallery3:  { alt: 'Deluxe Room',        category: 'Rooms' },
  gallery4:  { alt: 'Restaurant',         category: 'Restaurant' },
  gallery5:  { alt: 'Banquet Hall',        category: 'Events' },
  gallery6:  { alt: 'Taj Mahal Tour',     category: 'Travel' },
  gallery7:  { alt: 'Suite',              category: 'Rooms' },
  gallery8:  { alt: 'Dining Area',        category: 'Restaurant' },
  gallery9:  { alt: 'North Indian Thali', category: 'Food' },
  gallery10: { alt: 'Wedding Ceremony',   category: 'Events' },
  gallery11: { alt: 'Vegetarian Cuisine', category: 'Food' },
  gallery12: { alt: 'Mathura Temple',     category: 'Travel' },
}

export default function GalleryPage() {
  const { images: siteImages, loading: imagesLoading } = useSiteImages()
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicGallery()
      .then((raw) => {
        const data = raw as GalleryImage[]
        if (data.length > 0) {
          setGalleryImages(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isLoading = loading || imagesLoading

  // Build fallback from images hook when Supabase returns nothing
  const displayImages: GalleryImage[] =
    galleryImages.length > 0
      ? galleryImages
      : Array.from({ length: 12 }, (_, i) => {
          const key = `gallery${i + 1}` as keyof typeof GALLERY_FALLBACK_META
          const meta = GALLERY_FALLBACK_META[key]
          return {
            id: `fallback-${i + 1}`,
            url: siteImages[key],
            alt: meta.alt,
            category: meta.category,
          }
        })

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative h-[55vh] min-h-[460px] flex items-end overflow-hidden">
          <Image
            src={siteImages.heroGallery}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c9a84c] border-t-transparent" />
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {displayImages.map(img => (
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
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
