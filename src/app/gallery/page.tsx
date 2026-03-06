import { getPublicGallery } from '@/lib/supabase-public'
import Image from 'next/image'

export const metadata = { title: 'Gallery | Sharda Palace', description: 'Photo gallery of Sharda Palace — hotel rooms, restaurant, events, and amenities.' }

export default async function GalleryPage() {
  const images = await getPublicGallery()

  return (
    <main className="pt-20">
      <section className="relative py-24 bg-gradient-to-b from-black to-[#0f0f23] text-center">
        <p className="text-[#c9a84c] text-sm tracking-[0.3em] uppercase mb-3">Visual Journey</p>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Gallery</h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">Glimpses of luxury, warmth, and unforgettable moments</p>
      </section>

      <section className="py-16 container mx-auto px-4">
        {images.length === 0 ? (
          <div className="text-center text-white/30 py-20">
            <p className="text-6xl mb-4">🖼️</p>
            <p>Gallery photos coming soon</p>
            <p className="text-sm mt-2">Add photos from the Admin → Images section</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {(images as Array<{id:string;url:string;alt?:string;category?:string}>).map(img => (
              <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden border border-white/5 hover:border-[#c9a84c]/20 transition-all group">
                <div className="relative aspect-auto">
                  <Image src={img.url} alt={img.alt ?? 'Sharda Palace'} width={400} height={300} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
