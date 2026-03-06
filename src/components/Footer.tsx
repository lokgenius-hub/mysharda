'use client'
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'
import { useSiteConfig } from '@/lib/use-site-config'

export default function Footer() {
  const year = new Date().getFullYear()
  const { config } = useSiteConfig()

  return (
    <footer className="bg-[#070714] border-t border-[#c9a84c]/10 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="text-[#c9a84c] text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {config.hotel_name}
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {config.description}
            </p>
            <div className="flex gap-3 mt-4">
              <a href={config.facebook_url} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#c9a84c] hover:border-[#c9a84c]/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={config.instagram_url} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#c9a84c] hover:border-[#c9a84c]/30 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={config.youtube_url} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#c9a84c] hover:border-[#c9a84c]/30 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                ['/', 'Home'], ['/hotel', 'Hotel Rooms'], ['/restaurant', 'Restaurant'],
                ['/menu', 'Our Menu'], ['/events', 'Events & Banquet'], ['/travel', 'Travel Packages'],
                ['/gallery', 'Gallery'], ['/blog', 'Blog'], ['/contact', 'Contact Us'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 hover:text-[#c9a84c] text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/40">
                <MapPin className="w-4 h-4 text-[#c9a84c] mt-0.5 shrink-0" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Phone className="w-4 h-4 text-[#c9a84c] shrink-0" />
                <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="hover:text-[#c9a84c] transition-colors">
                  {config.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <Mail className="w-4 h-4 text-[#c9a84c] shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-[#c9a84c] transition-colors">
                  {config.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-white/40">
              <li className="flex justify-between"><span>Restaurant</span><span className="text-white/60">{config.restaurant_hours}</span></li>
              <li className="flex justify-between"><span>Reception</span><span className="text-white/60">{config.reception_hours}</span></li>
              <li className="flex justify-between"><span>Check-In</span><span className="text-white/60">{config.checkin_time}</span></li>
              <li className="flex justify-between"><span>Check-Out</span><span className="text-white/60">{config.checkout_time}</span></li>
              <li className="mt-3">
                <a
                  href={`https://wa.me/${config.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600/30 text-green-400 text-sm rounded-lg hover:bg-green-600/30 transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/25 text-xs">
            © {year} {config.hotel_name}. All rights reserved.
          </p>
          <p className="text-white/15 text-xs">
            Powered by HospiFlow
          </p>
        </div>
      </div>
    </footer>
  )
}
