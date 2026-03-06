'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useSiteConfig } from '@/lib/use-site-config'
import {
  ChevronLeft, Image as ImageIcon, MapPin, BedDouble, Utensils,
  Table2, MessageSquare, Calendar, Coins, Star, BookOpen, Plane, Users,
  Settings, Zap, Phone, ExternalLink, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

/* ─── Section accordion ─── */
function Module({
  num, icon: Icon, title, color = '#c9a84c', children,
}: {
  num: number; icon: React.ElementType; title: string; color?: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-black font-black text-sm"
          style={{ background: color }}>
          {num}
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
          <span className="text-white font-semibold text-sm truncate">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-white/5 text-sm text-white/60 leading-relaxed space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

/* ─── Step list ─── */
function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2 ml-1">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 text-[#c9a84c] text-[10px] font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: s }} />
        </li>
      ))}
    </ol>
  )
}

/* ─── Tip box ─── */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 p-3 rounded-xl bg-[#c9a84c]/8 border border-[#c9a84c]/20 text-[#c9a84c]/80 text-xs">
      <span className="flex-shrink-0 mt-0.5">💡</span>
      <div>{children}</div>
    </div>
  )
}

/* ─── Sub-heading ─── */
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-white/80 font-semibold text-xs uppercase tracking-widest mt-3 mb-1">{children}</p>
}

/* ─── Quick ref table ─── */
const QUICK_REF = [
  ['Take a food order + print bill',   'Admin → POS'],
  ['Change Google Maps',               'Admin → Site Config → 📍 Maps'],
  ['Change any image on website',      'Admin → Images → find slot → paste URL → Save'],
  ['Change phone / WhatsApp',          'Admin → Site Config → 📞 Contact'],
  ['Change hotel name / tagline',      'Admin → Site Config → 🏨 General'],
  ['Add / edit / remove menu items',   'Admin → Menu'],
  ['Mark table as occupied',           'Admin → Tables → click status button'],
  ['Mark room as occupied/cleaning',   'Admin → Rooms → click status button'],
  ['Add a hotel room booking',         'Admin → Calendar → + Add Booking → Room Booking'],
  ['Add a banquet venue booking',      'Admin → Calendar → + Add Booking → Venue Booking'],
  ['Reply to customer enquiry',        'Admin → Enquiries → WhatsApp button'],
  ['Approve a customer review',        'Admin → Testimonials → Pending tab → ✓'],
  ['Write / publish a blog post',      'Admin → Blog → New Post'],
  ['Add a travel package',             'Admin → Travel → Add Package'],
  ['Look up loyalty coins balance',    'Admin → Loyalty Coins → enter phone'],
  ['Add a staff login account',        'Admin → Staff Users → Add User'],
  ['Set GST number on bill',           'Admin → Site Config → 📞 Contact → GST Number'],
]

export default function UserGuidePage() {
  const { config } = useSiteConfig()

  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0f0f23] to-[#0a0a1a] py-16 px-4 border-b border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#c9a84c] text-sm mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to website
            </Link>
            <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-3">Admin Panel</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              User Guide
            </h1>
            <p className="text-white/50 text-lg mb-8">
              Everything you need to manage <span className="text-white/80">{config.hotel_name}</span> — step by step.
            </p>

            {/* Getting started card */}
            <div className="rounded-2xl bg-[#c9a84c]/8 border border-[#c9a84c]/20 p-6 space-y-4">
              <p className="text-[#c9a84c] font-bold text-sm uppercase tracking-wider">Getting Started</p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 text-xs mb-1">Public Website</p>
                  <a href="https://lokgenius-hub.github.io/mysharda" target="_blank" rel="noopener noreferrer"
                    className="text-white/80 hover:text-[#c9a84c] transition-colors flex items-center gap-1">
                    lokgenius-hub.github.io/mysharda <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Admin Panel</p>
                  <Link href="/admin" className="text-white/80 hover:text-[#c9a84c] transition-colors flex items-center gap-1">
                    …/mysharda/admin <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Admin Email</p>
                  <p className="text-white/80">admin@shardapalace.in</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">No server needed</p>
                  <p className="text-white/80">Everything runs in the browser</p>
                </div>
              </div>
              <Link href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c9a84c] hover:bg-[#d4b45e] text-black font-bold rounded-xl text-sm transition-colors">
                <Zap className="w-4 h-4" /> Open Admin Panel
              </Link>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto space-y-3">

            <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Click any module to expand step-by-step instructions</p>

            {/* 1 POS */}
            <Module num={1} icon={Zap} title="POS Terminal — Take Food Orders & Print Bills">
              <Steps items={[
                'Go to <b class="text-white">Admin → POS</b> (lightning bolt icon in sidebar)',
                'Browse the menu grid on the left. Use <b class="text-white">category tabs</b> or the <b class="text-white">search bar</b> to find items',
                'Click any menu item to add it to the cart (right panel)',
                'Use <b class="text-white">+ / −</b> buttons to change quantity. Trash icon removes an item',
                'Select <b class="text-white">Order Type</b>: Dine In / Takeaway / Delivery. For Dine In, enter the table name (e.g. T-4)',
                'Select <b class="text-white">Payment Mode</b>: Cash / UPI / Card / Split / Credit-Room',
                'Click the gold <b class="text-white">Pay ₹…</b> button. Order is saved instantly',
              ]} />
              <Sub>Print the Bill</Sub>
              <Steps items={[
                'After paying, a <b class="text-white">Last Bill</b> bar appears at the bottom of the cart',
                'Click the <b class="text-white">printer icon</b> on that bar',
                'A bill popup opens and the print dialog appears automatically',
              ]} />
              <Tip>Bill shows hotel name, address, phone, GSTIN, all items with amounts, CGST+SGST, total, and payment mode.</Tip>
              <Sub>Hotel Guest Food Charge</Sub>
              <Steps items={[
                'Select order type: <b class="text-white">Dine In</b>',
                'Enter the room number as the table name (e.g. <b class="text-white">Room 205</b>)',
                'Payment mode: <b class="text-white">Credit / Room</b>',
                'Click Pay → Print bill → hand to guest at checkout',
              ]} />
              <Sub>Offline Mode</Sub>
              <p>If internet drops, orders save locally in the browser. A <b className="text-white">Sync</b> counter appears — it auto-syncs when connection returns.</p>
            </Module>

            {/* 2 Images */}
            <Module num={2} icon={ImageIcon} title="Change Images on Any Page">
              <p>Every image on the website has a named slot. Replace it by pasting a new URL.</p>
              <Sub>How to get an image URL</Sub>
              <Steps items={[
                '<b class="text-white">Supabase Storage (best):</b> supabase.com → your project → Storage → create bucket <b class="text-white">site-images</b> (Public) → upload photo → click it → copy the URL',
                '<b class="text-white">Google Drive:</b> Upload → Share (Anyone with link) → copy URL → change <code class="text-[#c9a84c]">drive.google.com/file/d/ID/view</code> to <code class="text-[#c9a84c]">drive.google.com/uc?id=ID</code>',
                '<b class="text-white">Any web image:</b> right-click the image → Copy Image Address',
              ]} />
              <Sub>How to replace an image</Sub>
              <Steps items={[
                'Go to <b class="text-white">Admin → Images</b>',
                'Find the slot (see table below)',
                'Paste the new URL in the text field under the preview',
                'Click <b class="text-white">Save</b> — live on website within 1 minute',
              ]} />
              <Sub>All 41 Image Slots</Sub>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white/50 font-semibold">Group</th>
                    <th className="text-left py-2 text-white/50 font-semibold">Which page</th>
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      ['🏛️ Page Heroes (8)', 'Top banner of each page: Home, Hotel, Restaurant, Events, Travel, Gallery, Menu, Blog'],
                      ['🛏️ Room Types (3)', 'Hotel page — Standard, Deluxe, Suite room cards'],
                      ['🏠 Homepage (5)', 'Service cards, About section, CTA banner'],
                      ['🍛 Restaurant (4)', 'North Indian, Veg, Sweets, Interior'],
                      ['🎉 Events (6)', 'Wedding, Birthday, Corporate, Seminar, Religious, Family'],
                      ['✈️ Travel (3)', 'Vrindavan, Mathura, Agra'],
                      ['🖼️ Gallery (12)', 'gallery1 → gallery12'],
                    ].map(([g, p]) => (
                      <tr key={g}><td className="py-2 pr-4 text-white/70">{g}</td><td className="py-2 text-white/40">{p}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Module>

            {/* 3 Google Maps */}
            <Module num={3} icon={MapPin} title="Change Google Maps Location">
              <Steps items={[
                'Go to <b class="text-white">Admin → Site Config</b> (gear icon near bottom of sidebar)',
                'Scroll to the <b class="text-white">📍 Location & Maps</b> section',
                'Go to <a href="https://maps.google.com" target="_blank" class="text-[#c9a84c]">maps.google.com</a> → search for the hotel → click <b class="text-white">Share → Embed a map</b>',
                'Copy only the URL inside <code class="text-[#c9a84c]">src="…"</code> (not the whole HTML tag)',
                'Paste into <b class="text-white">Google Maps Embed</b> field → click Save',
                'Also update <b class="text-white">Google Maps Link</b> — used for the "Get Directions" button',
              ]} />
              <Tip>Changes appear on the public website within 1 minute automatically.</Tip>
            </Module>

            {/* 4 Rooms */}
            <Module num={4} icon={BedDouble} title="Rooms Management">
              <Sub>Add a Room</Sub>
              <Steps items={[
                'Admin → Rooms → click <b class="text-white">Add Room</b>',
                'Fill in: Name, Type (Standard/Deluxe/Suite/Banquet/Conference), Capacity, Price per Night',
                'Set status: Available / Occupied / Maintenance / Cleaning → Save',
              ]} />
              <Sub>Quick Status Update</Sub>
              <p>Each room card has 4 coloured buttons — click one to instantly change status (no Save needed):</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                {[['✅ Available','green'],['🔵 Occupied','blue'],['🔴 Maintenance','red'],['🟡 Cleaning','amber']].map(([l]) => (
                  <span key={l} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60">{l}</span>
                ))}
              </div>
              <Sub>Edit or Remove</Sub>
              <p>Pencil icon = edit all fields. Trash icon = deactivate (hidden from website, data kept).</p>
            </Module>

            {/* 5 Menu */}
            <Module num={5} icon={Utensils} title="Menu Management">
              <Sub>Add a Menu Item</Sub>
              <Steps items={[
                'Admin → Menu → <b class="text-white">Add Item</b>',
                'Name, Category (Starters / Main Course / Breads / Rice & Biryani / Desserts / Beverages / Chinese / South Indian / Snacks)',
                'Price (₹), Is Veg (green dot in POS), GST Rate (0/5/12/18 %)',
                'Sort Order — lower number appears first. Is Active — uncheck to hide from POS and website',
                'Save — item appears in POS immediately',
              ]} />
              <Tip>To temporarily hide an item without deleting it, edit it and uncheck <b>Is Active</b>.</Tip>
            </Module>

            {/* 6 Tables */}
            <Module num={6} icon={Table2} title="Restaurant Tables">
              <Steps items={[
                'Admin → Tables → <b class="text-white">Add Table</b>',
                'Enter name (e.g. T-1, Window Table) and capacity (seats) → Save',
              ]} />
              <p className="mt-2">Quick-status buttons on each table card: ✅ Available → 🔵 Occupied → 🟡 Reserved → 🩷 Cleaning. Click to save instantly.</p>
            </Module>

            {/* 7 Enquiries */}
            <Module num={7} icon={MessageSquare} title="Customer Enquiries">
              <p>Enquiries come from the <b className="text-white">Contact form</b> on the public website. Gold dot = unread.</p>
              <Sub>Actions on each enquiry</Sub>
              <div className="space-y-2 text-xs">
                {[
                  ['WhatsApp button','Always visible — opens WhatsApp with a pre-written reply. Best first step.'],
                  ['Phone icon','Marks as Contacted'],
                  ['Check icon','Marks as Confirmed'],
                  ['X icon','Marks as Cancelled'],
                ].map(([b, d]) => (
                  <div key={b} className="flex gap-2">
                    <span className="text-[#c9a84c] font-semibold w-28 flex-shrink-0">{b}</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
              <Tip>Use the Type and Status dropdowns at the top to filter enquiries by category or progress.</Tip>
            </Module>

            {/* 8 Calendar */}
            <Module num={8} icon={Calendar} title="Bookings Calendar">
              <Sub>Add a Room Booking</Sub>
              <Steps items={[
                'Admin → Calendar → <b class="text-white">+ Add Booking</b> → Room Booking',
                'Choose room (available rooms only shown), guest name, phone, check-in & check-out dates, notes',
                'Save → booking appears on calendar as a blue chip',
              ]} />
              <Sub>Add a Venue / Banquet Booking</Sub>
              <Steps items={[
                'Admin → Calendar → <b class="text-white">+ Add Booking</b> → Venue Booking',
                'Venue: Sharda Banquet Hall / Garden Lawn / Terrace Deck',
                'Event type, client name, phone, event date, notes → Save',
              ]} />
              <p className="mt-2 text-xs">Click any date on the calendar to see full booking details. Click <b className="text-white">Cancel</b> on a booking to cancel it.</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs">
                {[['🔵','Confirmed'],['🟢','Checked In'],['⚫','Checked Out'],['🔴','Cancelled']].map(([c,l]) => (
                  <span key={l}>{c} {l}</span>
                ))}
              </div>
            </Module>

            {/* 9 Coins */}
            <Module num={9} icon={Coins} title="Loyalty Coins">
              <p>Customers earn coins based on spend. Coins can be redeemed for discounts.</p>
              <Sub>Look up a customer balance</Sub>
              <Steps items={[
                'Admin → Loyalty Coins',
                'Enter customer phone number → click <b class="text-white">Search</b>',
                'See their coin balance and rupee discount equivalent',
              ]} />
              <p className="text-xs mt-2">Config values (spend per coin, coin value, minimum to redeem) are shown at the top of the page.</p>
            </Module>

            {/* 10 Testimonials */}
            <Module num={10} icon={Star} title="Testimonials (Customer Reviews)">
              <p>Reviews submitted on the public website are <b className="text-white">hidden by default</b> until you approve them.</p>
              <Steps items={[
                'Admin → Testimonials → click the <b class="text-white">Pending</b> tab',
                'Read the review → click the green <b class="text-white">✓ Approve</b> icon',
                'Review appears on the public homepage testimonials section immediately',
              ]} />
              <p className="text-xs mt-1">To hide an approved review: go to Approved tab → click the amber X icon.</p>
            </Module>

            {/* 11 Blog */}
            <Module num={11} icon={BookOpen} title="Blog Posts">
              <Steps items={[
                'Admin → Blog → <b class="text-white">New Post</b>',
                'Title, Slug (auto-filled from title), Excerpt (short summary), Content (full article)',
                'Category (free text: News / Offers / Travel / Events), Status: Draft or Published',
                'Save',
              ]} />
              <Tip>Click the <b>eye icon</b> on any post to instantly publish or unpublish without opening the editor.</Tip>
            </Module>

            {/* 12 Travel */}
            <Module num={12} icon={Plane} title="Travel Packages">
              <Steps items={[
                'Admin → Travel → <b class="text-white">Add Package</b>',
                'Title, Price (₹), Duration (e.g. 3N/4D), Description',
                'Inclusions — type one per line (e.g. AC Vehicle, Lunch, Guide)',
                'Is Active — uncheck to hide from website → Save',
              ]} />
              <p className="text-xs mt-1">Package appears on the public Travel page immediately after saving.</p>
            </Module>

            {/* 13 Users */}
            <Module num={13} icon={Users} title="Staff Users">
              <Steps items={[
                'Admin → Staff Users → <b class="text-white">Add User</b>',
                'Username, Display Name (optional), Password, Role (Admin / Manager / Staff / Waiter)',
                'Save',
              ]} />
              <p className="text-xs mt-1">Click <b className="text-white">Deactivate</b> on a staff member to remove their login access. Click <b className="text-white">Activate</b> to restore. The superadmin account cannot be deactivated.</p>
            </Module>

            {/* 14 Site Config */}
            <Module num={14} icon={Settings} title="Site Configuration — Text, Phone, Maps, GST, Social">
              <p>This controls everything on the website. Edit any field → border turns gold → click <b className="text-white">Save</b>.</p>
              <Sub>🏨 General</Sub>
              <div className="space-y-1 text-xs">
                {[['hotel_name','Hotel name on header, footer, and printed bill'],['tagline','Subtitle on homepage hero'],['description','Footer description']].map(([k,v]) => (
                  <div key={k} className="flex gap-2"><span className="text-[#c9a84c] font-mono w-28 flex-shrink-0">{k}</span><span>{v}</span></div>
                ))}
              </div>
              <Sub>📞 Contact Information</Sub>
              <div className="space-y-1 text-xs">
                {[['phone','Phone shown on all pages'],['email','Email in footer & contact page'],['whatsapp','WhatsApp quick-contact (numbers only, e.g. 917303584266)'],['address','Address in footer & contact page'],['gst_number','GSTIN printed on every bill']].map(([k,v]) => (
                  <div key={k} className="flex gap-2"><span className="text-[#c9a84c] font-mono w-28 flex-shrink-0">{k}</span><span>{v}</span></div>
                ))}
              </div>
              <Sub>🌐 Social Media</Sub>
              <p className="text-xs">facebook_url, instagram_url, youtube_url — links shown in footer.</p>
              <Sub>📍 Location & Maps</Sub>
              <p className="text-xs">google_maps_embed (embedded map) + google_maps_link (&ldquo;Get Directions&rdquo; button).</p>
              <Sub>🕐 Timings</Sub>
              <div className="space-y-1 text-xs">
                {[['restaurant_hours','Restaurant page & footer'],['reception_hours','Contact page'],['checkin_time','Hotel page'],['checkout_time','Hotel page']].map(([k,v]) => (
                  <div key={k} className="flex gap-2"><span className="text-[#c9a84c] font-mono w-28 flex-shrink-0">{k}</span><span>{v}</span></div>
                ))}
              </div>
              <Tip>All changes reflect on the public website within 1 minute.</Tip>
            </Module>

          </div>
        </section>

        {/* Quick reference */}
        <section className="py-12 px-4 bg-[#0a0a1a] border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#c9a84c] text-xs uppercase tracking-widest mb-2">Quick Reference</p>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>What Goes Where</h2>
            <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.07]">
                    <th className="text-left px-5 py-3 text-white/50 font-semibold text-xs uppercase tracking-wider">Task</th>
                    <th className="text-left px-5 py-3 text-white/50 font-semibold text-xs uppercase tracking-wider">Go To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {QUICK_REF.map(([task, path]) => (
                    <tr key={task} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-white/70">{task}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#c9a84c]/10 text-[#c9a84c] text-xs font-medium">{path}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#c9a84c] hover:bg-[#d4b45e] text-black font-bold rounded-xl text-sm transition-colors">
                <Zap className="w-4 h-4" /> Open Admin Panel
              </Link>
              <a href={`tel:${('+91 73035 84266').replace(/\s/g,'')}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold rounded-xl text-sm transition-colors">
                <Phone className="w-4 h-4" /> Need help? Call us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
