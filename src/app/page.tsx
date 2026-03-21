'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import EditableImage from '@/components/EditableImage'
import EditableText from '@/components/EditableText'
import HeroSlider from '@/components/HeroSlider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useSiteImages } from '@/lib/use-site-images'
import { useSiteConfig, safeUrl } from '@/lib/use-site-config'
import { getPublicTestimonials, getPublicMenu, submitTestimonial } from '@/lib/supabase-public'
import { Star, BedDouble, Utensils, PartyPopper, MapPin, ChevronRight, Phone, ArrowRight, Facebook, Instagram, Youtube, Send } from 'lucide-react'
import { getFeatures } from '@/lib/features'

const f = getFeatures()

type MenuItem = { id: string; name: string; price: number; is_veg: boolean }
type Testimonial = { id: string; name: string; rating: number; review: string; designation?: string }

export default function HomePage() {
  const { images } = useSiteImages()
  const { config } = useSiteConfig()
  const [featuredMenu, setFeaturedMenu] = useState<MenuItem[]>([])
  const [topTestimonials, setTopTestimonials] = useState<Testimonial[]>([])

  // Feedback form state
  const [fbForm, setFbForm] = useState({ name: '', designation: '', rating: 5, review: '' })
  const [fbStatus, setFbStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [fbError, setFbError] = useState('')

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault()
    if (!fbForm.review.trim() || !fbForm.name.trim()) return
    setFbStatus('loading'); setFbError('')
    try {
      await submitTestimonial({
        name: fbForm.name.trim(),
        rating: fbForm.rating,
        review: fbForm.review.trim(),
        designation: fbForm.designation.trim() || undefined,
      })
      setFbStatus('success')
      setFbForm({ name: '', designation: '', rating: 5, review: '' })
      // Refresh testimonials list
      getPublicTestimonials().then(d => setTopTestimonials((d as Testimonial[]).slice(0, 3))).catch(() => {})
    } catch (err) {
      setFbStatus('error')
      setFbError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  useEffect(() => {
    getPublicMenu().then(d => setFeaturedMenu((d as MenuItem[]).slice(0, 6))).catch(() => {})
    getPublicTestimonials().then(d => setTopTestimonials((d as Testimonial[]).slice(0, 3))).catch(() => {})
  }, [])

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '100svh' }}>
          <HeroSlider
            slides={[
              { src: images.heroHome,       alt: 'Sharda Palace luxury hotel' },
              { src: images.heroHotel,      alt: 'Hotel Rooms at Sharda Palace' },
              { src: images.heroEvents,     alt: 'Grand banquet & events hall' },
              { src: images.heroRestaurant, alt: 'Fine dining restaurant' },
              { src: images.ctaBanner,      alt: 'Royal hospitality' },
            ]}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-[var(--bg-deep)]" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, color-mix(in srgb, var(--primary) 5%, transparent) 0%, transparent 60%)' }} />
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)]/15 border border-[var(--primary)]/30 rounded-full text-[var(--primary)] text-xs font-semibold mb-8 backdrop-blur-sm fade-up">
              ✦ &nbsp; {config.tagline || `Luxury Hotel & Banquet · Bhabua, Bihar`}
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] fade-up-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome to<br/><span className="shimmer">{config.hotel_name}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed fade-up-2">
              {config.description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center fade-up-3">
              <Link href="/contact" className="btn-gold text-sm">
                {f.hotel ? 'Book Your Stay' : 'Reserve a Table'} <ArrowRight className="w-4 h-4" />
              </Link>
              {f.hotel && <Link href="/hotel" className="btn-outline text-sm">Explore Rooms</Link>}
              {!f.hotel && f.restaurant && <Link href="/menu" className="btn-outline text-sm">View Menu</Link>}
            </div>

            {/* Social media links — below hero CTA buttons */}
            <div className="flex items-center justify-center gap-4 mt-7 fade-up-3">
              <a
                href={safeUrl(config.facebook_url || 'https://facebook.com')}
                target="_blank" rel="noopener noreferrer" title="Facebook"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                style={{ background: 'rgba(24,119,242,0.15)', border: '1.5px solid rgba(24,119,242,0.45)', color: '#1877F2' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(24,119,242,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(24,119,242,0.15)')}>
                <Facebook style={{ width: '20px', height: '20px' }} />
              </a>
              <a
                href={safeUrl(config.instagram_url || 'https://instagram.com')}
                target="_blank" rel="noopener noreferrer" title="Instagram"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                style={{ background: 'rgba(225,48,108,0.15)', border: '1.5px solid rgba(225,48,108,0.45)', color: '#E1306C' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,48,108,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(225,48,108,0.15)')}>
                <Instagram style={{ width: '20px', height: '20px' }} />
              </a>
              <a
                href={safeUrl(config.youtube_url || 'https://youtube.com')}
                target="_blank" rel="noopener noreferrer" title="YouTube"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                style={{ background: 'rgba(255,0,0,0.15)', border: '1.5px solid rgba(255,0,0,0.4)', color: '#FF0000' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,0,0,0.28)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,0,0,0.15)')}>
                <Youtube style={{ width: '20px', height: '20px' }} />
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-20 pt-8 border-t border-white/10 max-w-lg mx-auto">
              {(f.hotel
                ? [['500+','Events Hosted'],['50+','Luxury Rooms'],['15+','Years Legacy']]
                : [['500+','Happy Guests'],['100+','Menu Items'],['10+','Years Legacy']]
              ).map(([n,l]) => (
                <div key={l} className="text-center">
                  <div className="text-3xl font-bold text-[var(--primary)]" style={{ fontFamily: 'Playfair Display, serif' }}>{n}</div>
                  <div className="text-white/40 text-xs mt-1 tracking-wide">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs animate-bounce">
            <span>Scroll</span><div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </section>

        {/* SERVICES */}
        <section className="py-24 px-4 bg-gradient-to-b from-[var(--bg-deep)] to-[#0a0a1a]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-3">What We Offer</p>
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>World-Class Hospitality</h2>
              <div className="divider-gold mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {([
                f.restaurant && { imgKey:'serviceRestaurant', icon:Utensils,    href:'/restaurant', label:'Restaurant', title:'Fine Dining',    desc:'Authentic North Indian cuisine by expert chefs. Pure veg and non-veg options, live tandoor, and curated beverages.' },
                f.hotel      && { imgKey:'serviceHotel',      icon:BedDouble,   href:'/hotel',      label:'Hotel Rooms', title:'Luxury Stays',  desc:'Spacious, elegantly furnished rooms with modern amenities. Standard, Deluxe, and Suite options for every occasion.' },
                f.events     && { imgKey:'serviceEvents',     icon:PartyPopper, href:'/events',     label:'Events',      title:'Grand Banquets', desc:'Weddings, corporate events, and social gatherings. Halls for 100 to 2000+ guests with décor and catering.' },
              ].filter(Boolean) as Array<{imgKey:string;icon:React.ElementType;href:string;label:string;title:string;desc:string}>).map(({ imgKey,icon:Icon,href,label,title,desc }) => (
                <Link key={href} href={href} className="group relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-[var(--primary)]/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[var(--primary)]/10">
                  <div className="aspect-[4/3] relative">
                    <EditableImage imageKey={imgKey} src={images[imgKey]} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full border border-white/10">
                      <Icon className="w-3.5 h-3.5 text-[var(--primary)]" /><span className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-3 line-clamp-2">{desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-[var(--primary)] text-sm font-semibold group-hover:gap-3 transition-all">Explore <ChevronRight className="w-4 h-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-white/[0.06]">
                <EditableImage imageKey="aboutImage" src={images.aboutImage} alt="Sharda Palace" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-[var(--primary)] text-black rounded-2xl p-5 shadow-2xl glow-gold">
                <div className="text-3xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>15+</div>
                <div className="text-[10px] font-bold uppercase tracking-wider">Years of Excellence</div>
              </div>
            </div>
            <div>
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-4">Our Story</p>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                <EditableText configKey="about_heading" value={config.about_heading}><span>{config.about_heading || 'A Heritage of Warmth & Royal Hospitality'}</span></EditableText>
              </h2>
              <p className="text-white/50 leading-relaxed mb-4">
                <EditableText configKey="about_text_1" value={config.about_text_1} multiline><span>{config.about_text_1 || 'Nestled in the heart of Bhabua, Sharda Palace has been the region\'s premier destination for luxury accommodation, authentic dining, and grand celebrations for over 15 years.'}</span></EditableText>
              </p>
              <p className="text-white/50 leading-relaxed mb-8">
                <EditableText configKey="about_text_2" value={config.about_text_2} multiline><span>{config.about_text_2 || 'From intimate family dinners to 2000-guest weddings, we bring the same dedication to excellence in every service we offer.'}</span></EditableText>
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[['50+','Luxury Rooms'],['500+','Events Hosted'],['10K+','Happy Guests'],['4.8★','Avg Rating']].map(([n,l]) => (
                  <div key={l} className="p-4 rounded-2xl glass"><div className="text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: 'Playfair Display, serif' }}>{n}</div><div className="text-white/40 text-xs mt-1">{l}</div></div>
                ))}
              </div>
              <Link href="/contact" className="btn-gold text-sm">Get in Touch <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>

        {/* MENU PREVIEW */}
        {featuredMenu.length > 0 && (
          <section className="py-24 px-4 bg-[#0a0a1a]">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-3">Taste of Excellence</p>
                  <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Popular Dishes</h2>
                </div>
                <Link href="/menu" className="hidden sm:flex items-center gap-1.5 text-[var(--primary)] text-sm font-semibold hover:gap-3 transition-all">Full Menu <ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredMenu.map((item) => (
                  <div key={item.id} className="glass rounded-2xl p-4 text-center hover:border-[var(--primary)]/20 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--primary)]/20 transition-colors"><span className="text-xl">🍛</span></div>
                    <p className="text-white/80 text-[11px] font-semibold leading-tight mb-2">{item.name}</p>
                    <p className="text-[var(--primary)] text-sm font-bold">₹{item.price}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-semibold ${item.is_veg ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>{item.is_veg ? '● Veg' : '● Non-Veg'}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIALS */}
        {topTestimonials.length > 0 && (
          <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-3">Guest Stories</p>
                <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>What Our Guests Say</h2>
                <div className="divider-gold mt-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topTestimonials.map((t) => (
                  <div key={t.id} className="p-7 glass rounded-3xl">
                    <div className="text-5xl text-[var(--primary)]/20 font-serif leading-none mb-3">&ldquo;</div>
                    <div className="flex mb-4">{[...Array(5)].map((_,i) => <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-[var(--primary)] fill-[var(--primary)]' : 'text-white/15'}`} />)}</div>
                    <p className="text-white/60 text-sm leading-relaxed mb-6 italic">&ldquo;{t.review}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                      <div className="w-9 h-9 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-bold text-sm">{t.name.charAt(0)}</div>
                      <div><p className="text-white/80 text-sm font-semibold">{t.name}</p>{t.designation ? <p className="text-white/30 text-xs">{t.designation}</p> : null}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FEEDBACK FORM */}
        <section className="py-20 px-4 bg-[#0a0a1a]">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-3">Share Your Experience</p>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Leave Us a Review</h2>
              <div className="divider-gold mt-4" />
            </div>
            {fbStatus === 'success' ? (
              <div className="text-center py-12 glass rounded-3xl">
                <div className="text-5xl mb-4">🙏</div>
                <h3 className="text-white font-bold text-xl mb-2">Thank You!</h3>
                <p className="text-white/50 text-sm">Your review has been published. We appreciate your feedback.</p>
                <button onClick={() => setFbStatus('idle')} className="mt-6 text-[var(--primary)] text-sm underline">Write another review</button>
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="glass rounded-3xl p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Your Name *</label>
                    <input
                      required
                      value={fbForm.name}
                      onChange={e => setFbForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[var(--primary)]/40 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Occasion / Designation</label>
                    <input
                      value={fbForm.designation}
                      onChange={e => setFbForm(p => ({ ...p, designation: e.target.value }))}
                      placeholder="e.g. Wedding Guest, Corporate Guest"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[var(--primary)]/40 placeholder-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-2">Your Rating *</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFbForm(p => ({ ...p, rating: s }))}
                        className="focus:outline-none"
                      >
                        <Star className={`w-7 h-7 transition-colors ${
                          s <= fbForm.rating
                            ? 'text-[var(--primary)] fill-[var(--primary)]'
                            : 'text-white/20 hover:text-white/40'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Your Review *</label>
                  <textarea
                    required
                    rows={4}
                    value={fbForm.review}
                    onChange={e => setFbForm(p => ({ ...p, review: e.target.value }))}
                    placeholder="Tell us about your experience..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[var(--primary)]/40 placeholder-white/20 resize-none"
                  />
                </div>

                {fbStatus === 'error' && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{fbError}</p>
                )}

                <button
                  type="submit"
                  disabled={fbStatus === 'loading'}
                  className="w-full flex items-center justify-center gap-2 btn-gold disabled:opacity-60"
                >
                  {fbStatus === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Review</>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* LOCATION */}
        <section className="py-24 px-4 bg-[#0a0a1a]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-4">Find Us</p>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Find Us Here</h2>
              <p className="text-white/50 leading-relaxed mb-6">
                <EditableText configKey="location_text" value={config.location_text} multiline><span>{config.location_text || 'Located in the heart of Bhabua, Kaimur, Bihar, easily accessible from the railway station and bus stand. Free parking available for all guests.'}</span></EditableText>
              </p>
              <div className="flex items-start gap-3 text-white/50 mb-8">
                <MapPin className="w-5 h-5 text-[var(--primary)] mt-0.5 shrink-0" />
                <span className="text-sm leading-relaxed">{config.address}</span>
              </div>
              <div className="flex gap-3">
                <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="btn-gold text-sm"><Phone className="w-4 h-4" /> Call Now</a>
                <a href={safeUrl(config.google_maps_link)} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">Get Directions</a>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden h-72 lg:h-96 border border-white/[0.06]">
              <iframe src={safeUrl(config.google_maps_embed)} className="w-full h-full" loading="lazy" title={`${config.hotel_name} location`} allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-32 px-4 overflow-hidden">
          <EditableImage imageKey="ctaBanner" src={images.ctaBanner} alt="Grand banquet" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/75" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-4">Start Your Journey</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Ready to Experience<br/>{config.hotel_name}?</h2>
            <p className="text-white/60 mb-10 text-lg">{f.hotel ? 'Book a room, reserve a table, or enquire about your dream event.' : 'Reserve a table, order online, or enquire about a special dining experience.'}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact" className="btn-gold">Make an Enquiry <ArrowRight className="w-4 h-4" /></Link>
              <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="btn-outline"><Phone className="w-4 h-4" /> {config.phone}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 transition-all hover:scale-110" title="WhatsApp">
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </>
  )
}
