'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useSiteConfig } from '@/lib/use-site-config'
import { getPublicCoinBalance } from '@/lib/supabase-public'
import { Coins, Search, Phone, Star, Gift, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoyaltyPage() {
  const { config } = useSiteConfig()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ balance: number; name: string | null } | null | undefined>(undefined)
  const [error, setError] = useState('')

  const checkBalance = async () => {
    if (phone.length !== 10) { setError('Please enter your 10-digit phone number.'); return }
    setLoading(true); setError(''); setResult(undefined)
    try {
      const data = await getPublicCoinBalance(phone)
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not fetch balance. Please ask staff at the counter.')
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg-deep)]">

        {/* HERO */}
        <section className="pt-24 pb-12 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 to-transparent pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[#a07830] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-[var(--primary)]/30">
              <Coins className="w-8 h-8 text-black" />
            </div>
            <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-3">Loyalty Program</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {config.hotel_name} Coins
            </h1>
            <p className="text-white/50 text-lg">
              Earn coins on every visit. Redeem for discounts on your next bill. Our way of saying thank you!
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-white font-bold text-xl mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Star className="w-6 h-6" />, title: 'Dine & Earn', desc: 'Earn coins every time you dine at our restaurant or stay at the hotel. Just give your phone number to the cashier.' },
                { icon: <Coins className="w-6 h-6" />, title: 'Coins Add Up', desc: 'Your coins are saved against your phone number. Check your balance anytime on this page or ask at the counter.' },
                { icon: <Gift className="w-6 h-6" />, title: 'Redeem & Save', desc: 'Redeem your coins for instant discounts on your next bill. The more you visit, the more you save!' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="glass rounded-2xl p-6 text-center border border-white/[0.06]">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/20 flex items-center justify-center mx-auto mb-4 text-[var(--primary)]">
                    {icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BALANCE CHECKER */}
        <section className="py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="glass rounded-2xl p-6 border border-white/[0.08]">
              <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                <Search className="w-5 h-5 text-[var(--primary)]" /> Check Your Balance
              </h2>
              <p className="text-white/40 text-sm mb-5">Enter the phone number linked to your account</p>

              <div className="flex gap-2 mb-4">
                <input
                  type="tel" inputMode="numeric" value={phone} maxLength={10}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g,'').slice(0,10)); setResult(undefined); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && checkBalance()}
                  placeholder="10-digit phone number"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base font-mono tracking-wider outline-none focus:border-[var(--primary)]/40 placeholder-white/20"
                />
                <button onClick={checkBalance} disabled={loading || phone.length !== 10}
                  className="px-4 py-3 bg-[var(--primary)] text-black rounded-xl font-bold text-sm disabled:opacity-40 transition-opacity hover:opacity-90 flex items-center gap-1.5">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Check</>}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-sm mb-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {result === null && (
                <div className="text-center py-4 text-white/40 text-sm">
                  <p>No account found for this number.</p>
                  <p className="mt-1 text-xs">Mention your phone number to staff on your next visit to start earning!</p>
                </div>
              )}

              {result && result.balance !== undefined && (
                <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl p-5 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[var(--primary)] mx-auto" />
                  {result.name && <p className="text-white/60 text-sm">Welcome back, <strong className="text-white">{result.name}</strong>!</p>}
                  <p className="text-4xl font-black text-[var(--primary)]">{result.balance}</p>
                  <p className="text-white/50 text-sm">Coins in your account</p>
                  <p className="text-xs text-white/30 pt-1">
                    Show this to staff when you pay to redeem your coins for a discount.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="py-12 px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="glass-gold rounded-2xl p-8 text-center">
              <p className="text-white/60 text-sm mb-4">
                Having trouble? Our staff at the counter can look up your balance instantly.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href={`tel:${config.phone.replace(/\s/g,'')}`}
                  className="btn-gold text-sm">
                  <Phone className="w-4 h-4" /> {config.phone || 'Call Us'}
                </a>
                <Link href="/contact" className="btn-outline text-sm">
                  Send Message <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
