import { getPublicMenu } from '@/lib/supabase-public'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { UtensilsCrossed, Phone, ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'Menu | Sharda Palace',
  description: 'Explore the full menu at Sharda Palace restaurant. Starters, main course, rice, breads, desserts and beverages.',
}

type MenuItem = {
  id: string
  name: string
  category: string
  price: number
  description?: string
  is_veg: boolean
  tax_rate?: number
}

const CATEGORY_IMAGES: Record<string, string> = {
  Starters:    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=120&q=80',
  'Main Course':'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=120&q=80',
  Rice:        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&q=80',
  Breads:      'https://images.unsplash.com/photo-1600628421060-9ccb06060e8e?w=120&q=80',
  Desserts:    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=120&q=80',
  Beverages:   'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&q=80',
}

export default async function MenuPage() {
  const raw = await getPublicMenu().catch(() => [])
  const menuItems = raw as MenuItem[]
  const categories = Array.from(new Set(menuItems.map(i => i.category)))

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative h-[50vh] min-h-[420px] flex items-end overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
            alt="Sharda Palace Menu" fill priority className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/restaurant" className="inline-flex items-center gap-2 text-white/50 hover:text-[#c9a84c] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Restaurant
              </Link>
              <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">Sharda Palace</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Our Menu
              </h1>
              <p className="text-white/50 text-lg mt-3 max-w-xl">
                A handcrafted selection of authentic dishes — pure vegetarian and non-veg
              </p>
            </div>
          </div>
        </section>

        {/* VEG / NON-VEG KEY */}
        <section className="bg-[#0a0a1a] border-b border-white/[0.06] py-4 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-green-500 bg-green-500 inline-block" />
              <span className="text-white/50 text-sm">Pure Vegetarian</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-red-500 bg-red-500 inline-block" />
              <span className="text-white/50 text-sm">Non-Vegetarian</span>
            </div>
            <div className="flex-1" />
            <p className="text-white/25 text-xs">Prices inclusive of applicable taxes</p>
          </div>
        </section>

        {/* MENU CATEGORIES */}
        {menuItems.length === 0 ? (
          <div className="py-40 text-center text-white/30">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Menu coming soon</p>
            <p className="text-sm mt-2">Add menu items from the Admin panel</p>
          </div>
        ) : (
          <div className="py-16 px-4">
            <div className="max-w-7xl mx-auto space-y-16">
              {categories.map(cat => {
                const items = menuItems.filter(i => i.category === cat)
                const catImg = CATEGORY_IMAGES[cat]
                return (
                  <div key={cat}>
                    {/* Category header */}
                    <div className="flex items-center gap-4 mb-8">
                      {catImg && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0">
                          <Image src={catImg} alt={cat} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{cat}</h2>
                        <p className="text-white/30 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/20 to-transparent ml-2" />
                    </div>

                    {/* Items grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 rounded-2xl glass hover:border-white/10 transition-all"
                        >
                          {/* Veg/non-veg indicator */}
                          <div className="mt-1 shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center"
                            style={{ borderColor: item.is_veg ? '#22c55e' : '#ef4444' }}>
                            <span className="w-2.5 h-2.5 rounded-sm"
                              style={{ backgroundColor: item.is_veg ? '#22c55e' : '#ef4444' }} />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white/90 font-semibold leading-tight">{item.name}</p>
                            {item.description && (
                              <p className="text-white/35 text-sm mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                            )}
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <p className="text-[#c9a84c] font-black text-lg">₹{item.price}</p>
                            {item.tax_rate && item.tax_rate > 0 && (
                              <p className="text-white/25 text-[10px]">+{item.tax_rate}% tax</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <section className="py-20 px-4 bg-[#0a0a1a]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-gold rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Loved What You See?
              </h2>
              <p className="text-white/50 mb-8">
                Reserve your table or place a group order — we cater for all sizes.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact?type=restaurant" className="btn-gold">Reserve a Table</Link>
                <a href="tel:+917303584266" className="btn-outline">
                  <Phone className="w-4 h-4" /> +91 73035 84266
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
