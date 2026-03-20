'use client'

import { useState, useEffect } from 'react'
import { getPublicPackages } from '@/lib/supabase-public'
import { useSiteImages } from '@/lib/use-site-images'
import { useSiteConfig } from '@/lib/use-site-config'
import EditableImage from '@/components/EditableImage'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft, ArrowRight, Clock, Check, Phone, MapPin } from 'lucide-react'

type Package = { id: string; title: string; description?: string; price: number; duration?: string; inclusions?: string[] }

export default function TravelPage() {
  const { images } = useSiteImages()
  const { config } = useSiteConfig()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicPackages()
      .then((data) => setPackages(data as Package[]))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false))
  }, [])

  const DEST_DEFAULT = [
    { name: 'Vrindavan',        imgKey: 'travelVrindavan', img: images.travelVrindavan, desc: 'Land of Lord Krishna — temples, ghats, and spiritual bliss' },
    { name: 'Mathura',          imgKey: 'travelMathura',   img: images.travelMathura,   desc: 'Birthplace of Lord Krishna — sacred, vibrant, ancient' },
    { name: 'Agra & Taj Mahal', imgKey: 'travelAgra',      img: images.travelAgra,      desc: 'One of the seven wonders — awe-inspiring marble marvel' },
  ]

  // Load from site_config if admin has customised destinations
  const DEST_IMGS = (() => {
    if (!config.travel_destinations) return DEST_DEFAULT
    try {
      const parsed: { name: string; imgKey: string; desc: string }[] = JSON.parse(config.travel_destinations)
      return parsed.map(d => ({ ...d, img: images[d.imgKey as keyof typeof images] || images.heroTravel }))
    } catch { return DEST_DEFAULT }
  })()

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative h-[65vh] min-h-[520px] flex items-end overflow-hidden">
          <EditableImage
            imageKey="heroTravel"
            src={images.heroTravel}
            alt="Travel Packages" fill priority className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-14 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--primary)] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-2">Sacred Journeys</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Travel Packages</h1>
              <p className="text-white/55 text-lg max-w-xl mb-8">Curated tours to Mathura, Vrindavan, Agra and beyond</p>
              <Link href="/contact?type=travel" className="btn-gold">Enquire Now <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        {/* DESTINATIONS */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[var(--primary)] text-xs uppercase tracking-widest mb-3">Where We Go</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Popular Destinations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {DEST_IMGS.map(d => (
                <div key={d.name} className="group rounded-3xl overflow-hidden glass hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <EditableImage imageKey={d.imgKey} src={d.img} alt={d.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{d.name}</span>
                    </div>
                  </div>
                  <div className="p-5"><p className="text-white/40 text-sm leading-relaxed">{d.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PACKAGES */}
        <section className="py-16 px-4 bg-[#0a0a1a]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[var(--primary)] text-xs uppercase tracking-widest mb-3">Packages</p>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Choose Your Journey</h2>
            </div>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center text-white/30 py-20">
                <p className="text-6xl mb-4">✈️</p>
                <p>Travel packages coming soon</p>
                <p className="text-sm mt-2">Add packages from Admin → Travel section</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(pkg => (
                  <div key={pkg.id} className="glass rounded-2xl p-7 flex flex-col hover:border-[var(--primary)]/20 transition-all hover:-translate-y-1">
                    <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{pkg.title}</h3>
                    {pkg.duration && <p className="flex items-center gap-1 text-[var(--primary)] text-sm mb-3"><Clock className="w-3.5 h-3.5" />{pkg.duration}</p>}
                    {pkg.description && <p className="text-white/45 text-sm mb-4 flex-1 leading-relaxed">{pkg.description}</p>}
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {pkg.inclusions.map(inc => <li key={inc} className="text-white/40 text-xs flex items-center gap-2"><Check className="w-3 h-3 text-green-400 shrink-0" />{inc}</li>)}
                      </ul>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
                      <div>
                        <p className="text-[var(--primary)] font-black text-2xl">₹{pkg.price.toLocaleString()}</p>
                        <p className="text-white/30 text-xs">per person</p>
                      </div>
                      <Link href="/contact?type=travel" className="btn-gold text-xs px-4 py-2">Book Now</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-gold rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Custom Tour? We Can Arrange It</h2>
              <p className="text-white/50 mb-8">Tell us your destination, group size and dates. We handle the rest.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact?type=travel" className="btn-gold">Plan My Trip</Link>
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
