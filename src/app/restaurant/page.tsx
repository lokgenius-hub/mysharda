'use client'
import EditableImage from '@/components/EditableImage'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useSiteImages } from '@/lib/use-site-images'
import { useSiteConfig } from '@/lib/use-site-config'
import { Utensils, Star, Clock, ChevronLeft, ArrowRight, Leaf, Phone } from 'lucide-react'

const HIGHLIGHTS = [
  { icon: '🌿', title: 'Pure & Fresh', desc: 'Locally sourced ingredients, prepared fresh every day by our master chefs' },
  { icon: '🔥', title: 'Live Tandoor', desc: 'Watch chefs work the clay oven for melt-in-mouth naans and tikkas' },
  { icon: '🍛', title: 'Thali Specials', desc: 'Unlimited traditional thali with rotis, dal, sabzi, rice, dessert and more' },
  { icon: '🎂', title: 'Banquet Catering', desc: 'Custom menus for weddings, corporate lunches, and all group events' },
]

const TIMINGS = [
  { meal: 'Breakfast', time: '7:00 AM - 10:30 AM' },
  { meal: 'Lunch', time: '12:00 PM - 3:30 PM' },
  { meal: 'High Tea', time: '4:00 PM - 6:00 PM' },
  { meal: 'Dinner', time: '7:00 PM - 11:00 PM' },
]

export default function RestaurantPage() {
  const { images } = useSiteImages()
  const { config } = useSiteConfig()

  const CUISINES = [
    { name: 'North Indian', imgKey: 'cuisineNorthIndian', img: images.cuisineNorthIndian, desc: 'Rich gravies, aromatic biryanis, butter chicken and dal makhani' },
    { name: 'Pure Veg',     imgKey: 'cuisineVeg',         img: images.cuisineVeg,          desc: 'Wholesome paneer dishes, fresh salads and vegetable curries' },
    { name: 'Sweets',       imgKey: 'cuisineSweets',      img: images.cuisineSweets,       desc: 'Gulab jamun, rasgulla, kheer and seasonal Indian sweets' },
  ]

  return (
    <>
      <Navbar />
      <main>
        <section className="relative h-[65vh] min-h-[520px] flex items-end overflow-hidden">
          <EditableImage imageKey="heroRestaurant" src={images.heroRestaurant} alt="Restaurant" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-14 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#c9a84c] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">Culinary Excellence</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Our Restaurant</h1>
              <p className="text-white/55 text-lg max-w-xl mb-8">Authentic North Indian flavours, crafted with love from tandoor to table</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/menu" className="btn-gold"><Utensils className="w-4 h-4" /> View Our Menu <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/contact?type=restaurant" className="btn-outline">Reserve a Table</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0a0a1a] border-b border-white/[0.06] py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-8 justify-center sm:justify-start">
            {[['5 Star','Guest Rating'],['200+','Menu Items'],['15+','Years Serving'],['500+','Daily Covers']].map(([val,lbl]) => (
              <div key={lbl} className="text-center sm:text-left">
                <p className="text-[#c9a84c] font-black text-xl">{val}</p>
                <p className="text-white/35 text-xs">{lbl}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#c9a84c] text-xs uppercase tracking-widest mb-3">What Makes Us Special</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>A Dining Experience Like No Other</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HIGHLIGHTS.map(h => (
                <div key={h.title} className="glass rounded-2xl p-7 hover:border-[#c9a84c]/20 transition-all">
                  <div className="text-4xl mb-4">{h.icon}</div>
                  <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{h.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-[#0a0a1a]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#c9a84c] text-xs uppercase tracking-widest mb-3">Our Cuisine</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Explore Our Kitchen</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CUISINES.map(c => (
                <div key={c.name} className="group rounded-3xl overflow-hidden glass hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <EditableImage imageKey={c.imgKey} src={c.img} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4"><span className="text-white font-bold text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>{c.name}</span></div>
                  </div>
                  <div className="p-5"><p className="text-white/40 text-sm leading-relaxed">{c.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[#c9a84c] text-xs uppercase tracking-widest mb-3">We Are Open</p>
                <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Dining Hours</h2>
                <div className="space-y-4">
                  {TIMINGS.map(t => (
                    <div key={t.meal} className="flex items-center justify-between glass rounded-xl px-5 py-4">
                      <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-[#c9a84c]" /><span className="text-white font-medium">{t.meal}</span></div>
                      <span className="text-white/50 text-sm">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden relative">
                  <EditableImage imageKey="restaurantInterior" src={images.restaurantInterior} alt="Restaurant interior" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" />
                </div>
                <div className="absolute -bottom-6 -left-6 glass-gold rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1"><Leaf className="w-4 h-4 text-green-400" /><span className="text-white font-bold">Veg Friendly</span></div>
                  <p className="text-white/50 text-xs">60% of menu items are pure vegetarian</p>
                </div>
                <div className="absolute -top-4 -right-4 glass rounded-2xl p-4 text-center">
                  <Star className="w-5 h-5 text-[#c9a84c] mx-auto mb-1 fill-current" />
                  <p className="text-white font-black text-2xl">4.8</p>
                  <p className="text-white/40 text-xs">Google Rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-[#0a0a1a]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-gold rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Ready to Dine With Us?</h2>
              <p className="text-white/50 mb-8">Browse our full menu or call to reserve your table now.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/menu" className="btn-gold"><Utensils className="w-4 h-4" /> View Full Menu</Link>
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
