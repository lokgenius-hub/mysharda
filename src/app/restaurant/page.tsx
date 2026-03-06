import { getPublicMenu } from '@/lib/supabase-public'
import Link from 'next/link'
import { Utensils } from 'lucide-react'

export const metadata = { title: 'Restaurant & Menu | Sharda Palace', description: 'Authentic North Indian cuisine at Sharda Palace restaurant. Pure veg and non-veg options.' }

export default async function RestaurantPage() {
  const menuItems = await getPublicMenu()
  const categories = Array.from(new Set((menuItems as Array<{category: string}>).map(i => i.category)))

  return (
    <main className="pt-20">
      <section className="relative py-24 bg-gradient-to-b from-black to-[#0f0f23] text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c9a84c 0%, transparent 60%)' }} />
        <div className="relative container mx-auto px-4">
          <p className="text-[#c9a84c] text-sm tracking-[0.3em] uppercase mb-3">Culinary Experience</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Restaurant & Menu</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Authentic flavors crafted with love — from tandoor to table</p>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        {categories.map(cat => {
          const items = (menuItems as Array<{id:string;name:string;category:string;price:number;description?:string;is_veg:boolean;tax_rate:number}>).filter(i => i.category === cat)
          return (
            <div key={cat} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <Utensils className="w-5 h-5 text-[#c9a84c]" />
                <h2 className="text-2xl font-serif font-bold text-white">{cat}</h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors">
                    <span className={`mt-1 w-3.5 h-3.5 rounded-sm border shrink-0 ${item.is_veg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'}`} style={{ minWidth: '14px' }} />
                    <div className="flex-1">
                      <p className="text-white/90 font-medium">{item.name}</p>
                      {item.description && <p className="text-white/40 text-sm mt-0.5">{item.description}</p>}
                    </div>
                    <p className="text-[#c9a84c] font-bold shrink-0">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <section className="py-16 text-center bg-gradient-to-b from-[#0f0f23] to-black">
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Reserve a Table</h2>
        <p className="text-white/50 mb-6">Book in advance for groups and special occasions</p>
        <Link href="/contact?type=restaurant" className="inline-flex items-center gap-2 px-8 py-3 bg-[#c9a84c] text-black rounded-xl font-semibold hover:bg-[#d4af5a] transition-colors text-lg">
          Make a Reservation
        </Link>
      </section>
    </main>
  )
}
