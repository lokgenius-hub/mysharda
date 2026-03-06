import { getPublicPackages } from '@/lib/supabase-public'
import Link from 'next/link'

export const metadata = { title: 'Travel Packages | Sharda Palace', description: 'Explore Vrindavan, Mathura, Agra and the Golden Triangle with curated travel packages from Sharda Palace.' }

export default async function TravelPage() {
  const packages = await getPublicPackages()

  return (
    <main className="pt-20">
      <section className="relative py-24 bg-gradient-to-b from-black to-[#0f0f23] text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c9a84c 0%, transparent 60%)' }} />
        <div className="relative container mx-auto px-4">
          <p className="text-[#c9a84c] text-sm tracking-[0.3em] uppercase mb-3">Sacred Journeys</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Travel Packages</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Curated tours to Mathura, Vrindavan, Agra, and beyond</p>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        {packages.length === 0 ? (
          <div className="text-center text-white/30 py-20">
            <p className="text-6xl mb-4">✈️</p>
            <p>Travel packages coming soon</p>
            <p className="text-sm mt-2">Add packages from Admin → Travel section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(packages as Array<{id:string;title:string;description?:string;price:number;duration?:string;inclusions?:string[]}>).map(pkg => (
              <div key={pkg.id} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#c9a84c]/20 transition-all flex flex-col">
                <div className="text-3xl mb-3">🗺️</div>
                <h3 className="text-white/90 font-serif font-semibold text-xl mb-1">{pkg.title}</h3>
                {pkg.duration && <p className="text-[#c9a84c] text-sm mb-2">{pkg.duration}</p>}
                {pkg.description && <p className="text-white/50 text-sm mb-4 flex-1">{pkg.description}</p>}
                {pkg.inclusions && pkg.inclusions.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {pkg.inclusions.map(inc => <li key={inc} className="text-white/40 text-xs flex items-center gap-1"><span className="text-green-400">✓</span>{inc}</li>)}
                  </ul>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <p className="text-[#c9a84c] font-bold text-2xl">₹{pkg.price.toLocaleString()}<span className="text-sm text-white/30 font-normal">/person</span></p>
                  <Link href="/contact?type=travel" className="px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">Book</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
