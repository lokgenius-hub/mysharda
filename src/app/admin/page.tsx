'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BedDouble, MessageSquare, Utensils, Table2, TrendingUp, Clock, CheckCircle, Calendar } from 'lucide-react'
import { adminListAll } from '@/lib/supabase-admin-client'

interface Stats {
  totalEnquiries: number; pendingEnquiries: number
  availableRooms: number; occupiedRooms: number; totalRooms: number
  activeTables: number; totalTables: number; activeMenu: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentEnquiries, setRecentEnquiries] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const [enquiries, rooms, tables, menuItems] = await Promise.all([
          adminListAll('enquiries', 'created_at'),
          adminListAll('rooms', 'sort_order'),
          adminListAll('restaurant_tables', 'name'),
          adminListAll('menu_items', 'sort_order'),
        ])
        const enqArr = enquiries as Record<string,unknown>[]
        const roomArr = rooms as Record<string,unknown>[]
        const tableArr = tables as Record<string,unknown>[]
        const menuArr = menuItems as Record<string,unknown>[]

        setStats({
          totalEnquiries: enqArr.length,
          pendingEnquiries: enqArr.filter(e => e.status === 'pending').length,
          availableRooms: roomArr.filter(r => r.status === 'available' && r.is_active).length,
          occupiedRooms: roomArr.filter(r => r.status === 'occupied' && r.is_active).length,
          totalRooms: roomArr.filter(r => r.is_active).length,
          activeTables: tableArr.filter(t => t.status === 'available' && t.is_active).length,
          totalTables: tableArr.filter(t => t.is_active).length,
          activeMenu: menuArr.filter(m => m.is_active).length,
        })
        setRecentEnquiries(enqArr.slice(0, 5))
      } catch {
        setError('Could not load dashboard data')
      }
    })()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
        </h1>
        <p className="text-white/30 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: MessageSquare, label: 'Pending Enquiries', value: stats?.pendingEnquiries ?? '—',
            sub: `${stats?.totalEnquiries ?? 0} total`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15',
            href: '/admin/enquiries',
          },
          {
            icon: BedDouble, label: 'Available Rooms', value: stats?.availableRooms ?? '—',
            sub: `${stats?.occupiedRooms ?? 0} occupied of ${stats?.totalRooms ?? 0}`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15',
            href: '/admin/rooms',
          },
          {
            icon: Table2, label: 'Available Tables', value: stats?.activeTables ?? '—',
            sub: `of ${stats?.totalTables ?? 0} total`, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/15',
            href: '/admin/tables',
          },
          {
            icon: Utensils, label: 'Active Menu Items', value: stats?.activeMenu ?? '—',
            sub: 'on website', color: 'text-[#c9a84c]', bg: 'bg-[#c9a84c]/10 border-[#c9a84c]/15',
            href: '/admin/menu',
          },
        ].map(({ icon: Icon, label, value, sub, color, bg, href }) => (
          <Link key={label} href={href}
            className={`p-5 rounded-2xl border ${bg} hover:scale-[1.02] transition-transform`}>
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <div className={`text-2xl font-bold ${color} mb-0.5`}>{value}</div>
            <div className="text-white/70 text-xs font-medium">{label}</div>
            <div className="text-white/30 text-[10px] mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white/60 text-xs uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/calendar', icon: Calendar, label: 'Bookings', color: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/20 text-emerald-400' },
            { href: '/admin/enquiries', icon: MessageSquare, label: 'View Enquiries', color: 'from-amber-500/15 to-yellow-500/10 border-amber-500/20 text-amber-400' },
            { href: '/admin/rooms', icon: BedDouble, label: 'Manage Rooms', color: 'from-blue-500/15 to-indigo-500/10 border-blue-500/20 text-blue-400' },
            { href: '/admin/menu', icon: Utensils, label: 'Edit Menu', color: 'from-orange-500/15 to-red-500/10 border-orange-500/20 text-orange-400' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href} href={href}
              className={`flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-br ${color} hover:scale-[1.02] transition-transform`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium text-white/80">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Enquiries */}
      {recentEnquiries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/60 text-xs uppercase tracking-wider">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-[#c9a84c] text-xs hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentEnquiries.map((e) => (
              <div key={String(e.id)} className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                {e.status === 'pending'
                  ? <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  : <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm truncate">{String(e.name ?? 'Unknown')}</p>
                  <p className="text-white/30 text-xs">{String(e.enquiry_type ?? '-')}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${e.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-green-500/15 text-green-400'}`}>
                  {String(e.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
        <h2 className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> System Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Admin connected (Supabase Auth)
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Supabase connected (cloud DB)
          </div>
          <div className="flex items-center gap-2 text-[#c9a84c]">
            <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            GitHub Pages website live
          </div>
        </div>
      </div>
    </div>
  )
}
