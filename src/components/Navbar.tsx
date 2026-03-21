'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, Home, Building2, Sparkles, Utensils, UtensilsCrossed, Compass, BookOpen, Mail, Lock, Coins } from 'lucide-react'
import { useSiteConfig } from '@/lib/use-site-config'
import { getFeatures } from '@/lib/features'

const f = getFeatures()

// Build nav links based on enabled features
const navLinks = [
  { href: '/',            label: 'Home',       icon: Home },
  f.hotel   && { href: '/hotel',       label: 'Hotel',      icon: Building2 },
  f.events  && { href: '/events',      label: 'Events',     icon: Sparkles },
  f.restaurant && { href: '/restaurant', label: 'Restaurant', icon: Utensils },
  f.restaurant && { href: '/menu',      label: 'Menu',       icon: UtensilsCrossed },
  f.travel  && { href: '/travel',      label: 'Tours',      icon: Compass },
  f.blog    && { href: '/blog',        label: 'Blog',       icon: BookOpen },
  f.coins   && { href: '/loyalty',     label: 'My Coins',   icon: Coins },
  { href: '/contact',    label: 'Contact',    icon: Mail },
].filter(Boolean) as { href: string; label: string; icon: React.ElementType }[]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { config } = useSiteConfig()

  // Normalised tel: href — strip spaces/dashes
  const telHref = `tel:${config.phone.replace(/[\s\-()]/g, '')}`

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#a07830] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
              <span className="text-black text-xs font-black tracking-tight">SP</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>{config.hotel_name}</div>
              <div className="text-[var(--primary)]/60 text-[9px] tracking-[0.2em] uppercase">{config.tagline || 'Hotel & Banquet'}</div>
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
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--primary)] rounded-full" />}
                </Link>
              )
            })}
          </div>

          {/* Right CTA */}
          <div className="hidden xl:flex items-center gap-3 shrink-0">
            <a href={telHref} className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-[var(--primary)] transition-colors">
              <Phone className="w-3 h-3" />
              {config.phone}
            </a>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:border-[var(--primary)]/40 text-white/30 hover:text-[var(--primary)]/80 text-[10px] font-semibold rounded-xl transition-all"
            >
              <Lock className="w-3 h-3" />
              Staff
            </Link>
            <a
              href={telHref}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[#d4b45e] text-black text-[11px] font-black rounded-xl transition-all hover:shadow-lg hover:shadow-[var(--primary)]/25 hover:-translate-y-0.5"
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
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20'
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
            href={telHref}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--primary)] text-black font-black rounded-xl text-sm mb-2"
          >
            <Phone className="w-4 h-4" />
            Call Now · {config.phone}
          </a>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-white/10 text-white/30 hover:text-white/60 rounded-xl text-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            Staff / Admin Login
          </Link>
        </div>
      )}
    </nav>
  )
}
