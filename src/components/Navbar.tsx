'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, Home, Building2, Sparkles, Utensils, UtensilsCrossed, Compass, BookOpen, Image as ImageIcon, Mail } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/hotel', label: 'Hotel', icon: Building2 },
  { href: '/events', label: 'Events', icon: Sparkles },
  { href: '/restaurant', label: 'Restaurant', icon: Utensils },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/travel', label: 'Tours', icon: Compass },
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/contact', label: 'Contact', icon: Mail },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '' || pathname.endsWith('/mysharda') || pathname.endsWith('/mysharda/')
    return pathname.includes(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#a07830] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
              <span className="text-black text-xs font-black tracking-tight">SP</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>Sharda Palace</div>
              <div className="text-[#c9a84c]/60 text-[9px] tracking-[0.2em] uppercase">Hotel & Banquet</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-[#c9a84c] bg-[#c9a84c]/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c9a84c] rounded-full" />}
                </Link>
              )
            })}
          </div>

          {/* Right CTA */}
          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <a href="tel:+917303584266" className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-[#c9a84c] transition-colors">
              <Phone className="w-3 h-3" />
              +91 73035 84266
            </a>
            <a
              href="tel:+917303584266"
              className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] hover:bg-[#d4b45e] text-black text-[11px] font-black rounded-xl transition-all hover:shadow-lg hover:shadow-[#c9a84c]/25 hover:-translate-y-0.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Now
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="xl:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="xl:hidden bg-black/95 backdrop-blur-2xl border-t border-white/5 px-4 py-5">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${
                    active
                      ? 'text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20'
                      : 'text-white/50 bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-semibold">{label}</span>
                </Link>
              )
            })}
          </div>
          <a
            href="tel:+917303584266"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#c9a84c] text-black font-black rounded-xl text-sm"
          >
            <Phone className="w-4 h-4" />
            Call Now · +91 73035 84266
          </a>
        </div>
      )}
    </nav>
  )
}
