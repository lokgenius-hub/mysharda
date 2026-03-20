'use client'
import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'
import { useSiteConfig, safeUrl } from '@/lib/use-site-config'
import EditableText from '@/components/EditableText'

export default function Footer() {
  const year = new Date().getFullYear()
  const { config } = useSiteConfig()

  return (
    <footer className="bg-[#070714] border-t border-[var(--primary)]/10 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="text-[var(--primary)] text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <EditableText configKey="hotel_name" value={config.hotel_name}>
                <span>{config.hotel_name}</span>
              </EditableText>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              <EditableText configKey="description" value={config.description} multiline>
                <span>{config.description}</span>
              </EditableText>
            </p>
            <div className="flex gap-3 mt-4">
              <a href={safeUrl(config.facebook_url)} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={safeUrl(config.instagram_url)} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={safeUrl(config.youtube_url)} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-colors">
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
                ['/blog', 'Blog'], ['/contact', 'Contact Us'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-white/40 hover:text-[var(--primary)] text-sm transition-colors">
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
                <MapPin className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                <EditableText configKey="address" value={config.address} multiline>
                  <span>{config.address}</span>
                </EditableText>
              </li>

              {/* Primary phone — always shown, editable */}
              <li className="flex items-start gap-3 text-sm text-white/40">
                <Phone className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <EditableText configKey="phone" value={config.phone}>
                    <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="hover:text-[var(--primary)] transition-colors">{config.phone}</a>
                  </EditableText>
                  {/* Optional second number */}
                  {config.phone_2 ? (
                    <EditableText configKey="phone_2" value={config.phone_2}>
                      <a href={`tel:${config.phone_2.replace(/\s/g, '')}`} className="hover:text-[var(--primary)] transition-colors">{config.phone_2}</a>
                    </EditableText>
                  ) : null}
                  {/* Optional third number */}
                  {config.phone_3 ? (
                    <EditableText configKey="phone_3" value={config.phone_3}>
                      <a href={`tel:${config.phone_3.replace(/\s/g, '')}`} className="hover:text-[var(--primary)] transition-colors">{config.phone_3}</a>
                    </EditableText>
                  ) : null}
                </div>
              </li>

              <li className="flex items-center gap-3 text-sm text-white/40">
                <Mail className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <EditableText configKey="email" value={config.email}>
                  <a href={`mailto:${config.email}`} className="hover:text-[var(--primary)] transition-colors">{config.email}</a>
                </EditableText>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-white/40">
              <li className="flex justify-between">
                <span>Restaurant</span>
                <EditableText configKey="restaurant_hours" value={config.restaurant_hours}><span className="text-white/60">{config.restaurant_hours}</span></EditableText>
              </li>
              <li className="flex justify-between">
                <span>Reception</span>
                <EditableText configKey="reception_hours" value={config.reception_hours}><span className="text-white/60">{config.reception_hours}</span></EditableText>
              </li>
              <li className="flex justify-between">
                <span>Check-In</span>
                <EditableText configKey="checkin_time" value={config.checkin_time}><span className="text-white/60">{config.checkin_time}</span></EditableText>
              </li>
              <li className="flex justify-between">
                <span>Check-Out</span>
                <EditableText configKey="checkout_time" value={config.checkout_time}><span className="text-white/60">{config.checkout_time}</span></EditableText>
              </li>
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
          <div className="flex items-center gap-4">
            <Link href="/userguide" className="text-white/15 hover:text-white/40 text-xs transition-colors">User Guide</Link>
            <Link href="/admin" className="text-white/15 hover:text-[var(--primary)] text-xs transition-colors">Staff Login</Link>
            <p className="text-white/15 text-xs">Powered by HospiFlow</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
