import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getPublicTestimonials, getPublicMenu } from '@/lib/supabase-public'
import { Star, BedDouble, Utensils, PartyPopper, MapPin, ChevronRight } from 'lucide-react'

export default async function HomePage() {
  // These calls go directly to Supabase — work on GitHub Pages too
  const [testimonials, menuItems] = await Promise.all([
    getPublicTestimonials().catch(() => []),
    getPublicMenu().catch(() => []),
  ])

  const featuredMenu = menuItems.slice(0, 6)
  const topTestimonials = testimonials.slice(0, 3)

  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* ━━━ HERO ━━━ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#c9a84c15_0%,transparent_70%)]" />

          {/* Decorative lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-[#c9a84c]/5 rounded-full"
                style={{
                  width: `${300 + i * 200}px`,
                  height: `${300 + i * 200}px`,
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-full text-[#c9a84c] text-xs font-medium mb-8">
              ✦ Luxury Hotel & Banquet · Bijnor, UP
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome to<br />
              <span className="shimmer">Sharda Palace</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience the finest in hospitality — from luxurious rooms and gourmet dining
              to grand celebrations in the heart of Bijnor.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-[#c9a84c] hover:bg-[#b8963e] text-[#0f0f23] font-bold rounded-xl transition-all hover:scale-105 text-base"
              >
                Book Your Stay
              </Link>
              <Link
                href="/hotel"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all text-base"
              >
                Explore Rooms
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/5">
              {[['500+', 'Events Hosted'], ['50+', 'Luxury Rooms'], ['15+', 'Years of Legacy']].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="text-2xl font-bold text-[#c9a84c]" style={{ fontFamily: 'Playfair Display, serif' }}>{n}</div>
                  <div className="text-white/30 text-sm mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ SERVICES ━━━ */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#c9a84c] text-sm uppercase tracking-widest mb-2">What We Offer</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                World-Class Hospitality
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: BedDouble, href: '/hotel',
                  title: 'Luxury Rooms', color: 'from-blue-500/20 to-indigo-500/10',
                  border: 'border-blue-500/20',
                  desc: 'Spacious, well-appointed rooms with modern amenities. AC deluxe, suite, and family rooms available.',
                  cta: 'View Rooms',
                },
                {
                  icon: Utensils, href: '/restaurant',
                  title: 'Fine Dining', color: 'from-orange-500/20 to-amber-500/10',
                  border: 'border-orange-500/20',
                  desc: 'Authentic North Indian cuisine crafted by expert chefs. Veg & non-veg, snacks, and beverages.',
                  cta: 'View Menu',
                },
                {
                  icon: PartyPopper, href: '/events',
                  title: 'Banquet & Events', color: 'from-pink-500/20 to-rose-500/10',
                  border: 'border-pink-500/20',
                  desc: 'Grand wedding halls, corporate events, and social gatherings. Capacity 100–2000 guests.',
                  cta: 'Book Event',
                },
              ].map(({ icon: Icon, href, title, color, border, desc, cta }) => (
                <Link
                  key={href} href={href}
                  className={`group p-8 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-transform`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#c9a84c]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-5">{desc}</p>
                  <span className="inline-flex items-center gap-1 text-[#c9a84c] text-sm group-hover:gap-2 transition-all">
                    {cta} <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ MENU PREVIEW ━━━ */}
        {featuredMenu.length > 0 && (
          <section className="py-20 px-4 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-[#c9a84c] text-sm uppercase tracking-widest mb-1">Taste of Excellence</p>
                  <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Popular Dishes
                  </h2>
                </div>
                <Link href="/restaurant" className="text-[#c9a84c] text-sm hover:underline hidden sm:block">
                  View Full Menu →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredMenu.map((item: Record<string, unknown>) => (
                  <div key={String(item.id)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-[#c9a84c]/30 transition-colors">
                    <div className="text-2xl mb-2">🍛</div>
                    <p className="text-white/80 text-xs font-medium leading-tight">{String(item.name)}</p>
                    <p className="text-[#c9a84c] text-sm font-bold mt-1">₹{Number(item.price)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] ${item.is_veg ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ━━━ TESTIMONIALS ━━━ */}
        {topTestimonials.length > 0 && (
          <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-[#c9a84c] text-sm uppercase tracking-widest mb-2">Guest Stories</p>
                <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  What Our Guests Say
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topTestimonials.map((t: Record<string, unknown>) => (
                  <div key={String(t.id)} className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Number(t.rating) ? 'text-[#c9a84c] fill-[#c9a84c]' : 'text-white/20'}`} />
                      ))}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">&ldquo;{String(t.review)}&rdquo;</p>
                    <p className="text-white/80 text-sm font-medium">{String(t.name)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ━━━ LOCATION ━━━ */}
        <section className="py-20 px-4 bg-white/[0.02]">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[#c9a84c] text-sm uppercase tracking-widest mb-2">Find Us</p>
                <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Prime Location in Bijnor
                </h2>
                <p className="text-white/50 leading-relaxed mb-6">
                  Located in the heart of Bijnor city, easy to reach from the railway station and bus stand.
                  Free parking available for all guests.
                </p>
                <div className="flex items-start gap-3 text-white/60 mb-6">
                  <MapPin className="w-5 h-5 text-[#c9a84c] mt-0.5 shrink-0" />
                  <span>Station Road, Near Bus Stand, Bijnor, Uttar Pradesh 246701</span>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a84c] hover:bg-[#b8963e] text-[#0f0f23] font-semibold rounded-xl transition-colors"
                >
                  Get Directions
                </Link>
              </div>
              <div className="rounded-2xl overflow-hidden h-64 bg-white/5 border border-white/10">
                <iframe
                  src="https://maps.google.com/maps?q=Bijnor+Uttar+Pradesh&z=13&output=embed"
                  className="w-full h-full"
                  loading="lazy"
                  title="Sharda Palace location"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ CTA ━━━ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-[#c9a84c]/10 to-[#1a1a2e] border border-[#c9a84c]/20">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Experience Sharda Palace?
              </h2>
              <p className="text-white/50 mb-8">
                Book a room, reserve a table, or enquire about your dream event.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#c9a84c] hover:bg-[#b8963e] text-[#0f0f23] font-bold rounded-xl transition-all hover:scale-105 text-lg"
              >
                Make an Enquiry
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/917303584266"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  )
}
