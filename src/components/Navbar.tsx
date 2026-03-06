'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/hotel', label: 'Hotel' },
  { href: '/restaurant', label: 'Restaurant' },
  { href: '/events', label: 'Events' },
  { href: '/travel', label: 'Travel' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f23]/90 backdrop-blur-xl border-b border-[#c9a84c]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center">
              <span className="text-[#c9a84c] text-xl font-bold" style={{ fontFamily: 'serif' }}>S</span>
            </div>
            <div>
              <div className="text-[#c9a84c] font-semibold text-sm leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Sharda Palace
              </div>
              <div className="text-white/30 text-[10px]">Luxury Hotel & Banquet</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm text-white/60 hover:text-[#c9a84c] transition-colors rounded-lg hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+917303584266"
              className="flex items-center gap-2 text-sm text-white/60 hover:text-[#c9a84c] transition-colors"
            >
              <Phone className="w-4 h-4" />
              +91 73035 84266
            </a>
            <Link
              href="/contact"
              className="px-4 py-2 bg-[#c9a84c] hover:bg-[#b8963e] text-[#0f0f23] text-sm font-semibold rounded-lg transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0f0f23] border-t border-white/5 px-4 py-4 space-y-1">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-white/70 hover:text-[#c9a84c] hover:bg-white/5 rounded-lg transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/5">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 bg-[#c9a84c] text-[#0f0f23] font-semibold rounded-lg text-center"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
