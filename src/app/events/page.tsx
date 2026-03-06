import Link from 'next/link'

export const metadata = { title: 'Events & Banquets | Sharda Palace', description: 'Host your wedding, conference, birthday and corporate events at Sharda Palace, Vrindavan.' }

const events = [
  { icon: '💒', title: 'Weddings', desc: 'Make your dream wedding a reality in our grand banquet hall with capacity for 500+ guests. Full catering, décor, and coordination.' },
  { icon: '🎂', title: 'Birthday Parties', desc: 'From intimate family gatherings to grand celebrations. Custom cake, decoration, DJ, and delicious food.' },
  { icon: '💼', title: 'Corporate Events', desc: 'Professional conference facilities with AV equipment, high-speed WiFi, catering, and accommodation for delegates.' },
  { icon: '🎓', title: 'Seminars & Workshops', desc: 'Fully equipped seminar halls for 50–500 participants. Projectors, sound systems, stationery included.' },
  { icon: '🙏', title: 'Religious Events', desc: 'Celebrate Satsang, Puja, Kirtan, and religious gatherings with authentic prasad catering.' },
  { icon: '👨‍👩‍👧‍👦', title: 'Family Functions', desc: 'Anniversaries, baby showers, retirement parties — we make every occasion special.' },
]

const venues = [
  { name: 'Grand Banquet Hall', capacity: '500+ guests', size: '6000 sq ft', features: ['Stage & LED wall', 'AC', 'Full catering', 'Parking for 100 cars'] },
  { name: 'Lawn & Garden', capacity: '500+ guests', size: '0.5 acres', features: ['Open-air', 'Night lighting', 'Bar setup', 'Live music'] },
  { name: 'Conference Room', capacity: '50 delegates', size: '1200 sq ft', features: ['Projector', 'Video conferencing', 'Whiteboard', 'Tea & coffee'] },
  { name: 'Private Dining Hall', capacity: '30 guests', size: '800 sq ft', features: ['Intimate setting', 'Customizable menu', 'Live cooking station'] },
]

export default function EventsPage() {
  return (
    <main className="pt-20">
      <section className="relative py-24 bg-gradient-to-b from-black to-[#0f0f23] text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c9a84c 0%, transparent 60%)' }} />
        <div className="relative container mx-auto px-4">
          <p className="text-[#c9a84c] text-sm tracking-[0.3em] uppercase mb-3">Celebrate Life</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Events & Banquets</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Creating unforgettable memories for every occasion</p>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(e => (
            <div key={e.title} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#c9a84c]/20 transition-all">
              <div className="text-4xl mb-4">{e.icon}</div>
              <h3 className="text-white font-serif font-semibold text-xl mb-2">{e.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-white text-center mb-10">Our Venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map(v => (
              <div key={v.name} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h3 className="text-white/90 font-semibold text-lg mb-1">{v.name}</h3>
                <p className="text-[#c9a84c] text-sm mb-3">{v.capacity} · {v.size}</p>
                <ul className="space-y-1">
                  {v.features.map(f => <li key={f} className="text-white/50 text-sm flex items-center gap-2"><span className="text-[#c9a84c]">✓</span>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center bg-gradient-to-b from-[#0f0f23] to-black">
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Plan Your Event</h2>
        <p className="text-white/50 mb-6">Get a free quote and consultation for your event</p>
        <Link href="/contact?type=event" className="inline-flex items-center gap-2 px-8 py-3 bg-[#c9a84c] text-black rounded-xl font-semibold hover:bg-[#d4af5a] transition-colors text-lg">
          Get a Free Quote
        </Link>
      </section>
    </main>
  )
}
