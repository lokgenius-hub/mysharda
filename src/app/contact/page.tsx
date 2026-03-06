'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { submitEnquiry } from '@/lib/supabase-public'
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'

const enquiryTypes = [
  { value: 'hotel', label: '🏨 Hotel Room Booking' },
  { value: 'event', label: '🎉 Event / Wedding Hall' },
  { value: 'restaurant', label: '🍽️ Restaurant Table' },
  { value: 'travel', label: '✈️ Travel Package' },
  { value: 'general', label: '💬 General Enquiry' },
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    enquiry_type: 'hotel', message: '',
    preferred_date: '', guests: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      await submitEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim().replace(/\D/g, '').slice(-10),
        email: form.email.trim() || undefined,
        enquiry_type: form.enquiry_type,
        message: form.message.trim() || undefined,
        preferred_date: form.preferred_date || undefined,
        guests: form.guests ? parseInt(form.guests) : undefined,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please call us directly.')
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <div className="py-16 px-4 text-center bg-gradient-to-b from-[#1a1a2e] to-[#0f0f23]">
          <p className="text-[#c9a84c] text-sm uppercase tracking-widest mb-2">Get In Touch</p>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Make an Enquiry
          </h1>
          <p className="text-white/40 mt-3 max-w-lg mx-auto">
            Fill the form and we&apos;ll get back to you within 2 hours. Or call us directly.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {[
              { icon: Phone, title: 'Call Us', lines: ['+91 73035 84266', 'Mon–Sun, 7 AM – 11 PM'], href: 'tel:+917303584266' },
              { icon: Mail, title: 'Email', lines: ['info@shardapalace.in', 'Reply within 4 hours'], href: 'mailto:info@shardapalace.in' },
              { icon: MapPin, title: 'Location', lines: ['Station Road, Near Bus Stand', 'Bijnor, UP 246701'], href: 'https://maps.google.com/?q=Bijnor' },
            ].map(({ icon: Icon, title, lines, href }) => (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-[#c9a84c]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#c9a84c]" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">{title}</p>
                  {lines.map(l => <p key={l} className="text-white/40 text-xs mt-0.5">{l}</p>)}
                </div>
              </a>
            ))}

            {/* WhatsApp */}
            <a
              href="https://wa.me/917303584266?text=Hi%2C%20I%20want%20to%20make%20an%20enquiry%20at%20Sharda%20Palace"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 bg-green-600/15 border border-green-600/30 rounded-2xl text-green-400 font-medium hover:bg-green-600/25 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Enquiry Form */}
          <div className="lg:col-span-2">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <CheckCircle className="w-16 h-16 text-green-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Enquiry Submitted!
                </h2>
                <p className="text-white/50 mb-6">
                  Thank you! Our team will call you within 2 hours.
                </p>
                <button
                  onClick={() => { setStatus('idle'); setForm({ name:'',phone:'',email:'',enquiry_type:'hotel',message:'',preferred_date:'',guests:'' }) }}
                  className="px-6 py-3 bg-[#c9a84c] text-[#0f0f23] font-semibold rounded-xl"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Tell Us What You Need
                </h2>

                {/* Enquiry type */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {enquiryTypes.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update('enquiry_type', t.value)}
                      className={`px-3 py-2 rounded-xl text-xs text-center transition-all border ${form.enquiry_type === t.value ? 'bg-[#c9a84c]/15 border-[#c9a84c]/40 text-[#c9a84c]' : 'bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Full Name *</label>
                    <input
                      required value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Phone Number *</label>
                    <input
                      required value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Email (optional)</label>
                    <input
                      type="email" value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Preferred Date</label>
                    <input
                      type="date" value={form.preferred_date}
                      onChange={e => update('preferred_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#c9a84c]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Message / Requirements</label>
                  <textarea
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Tell us about your requirements..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg || 'Failed to submit. Please call us at +91 73035 84266'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-60 text-[#0f0f23] font-bold rounded-xl transition-colors text-base"
                >
                  {status === 'loading' ? (
                    <><div className="w-5 h-5 border-2 border-[#0f0f23]/30 border-t-[#0f0f23] rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Send Enquiry</>
                  )}
                </button>
                <p className="text-white/25 text-xs text-center">
                  We typically respond within 2 hours. Your data is secure and never shared.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
