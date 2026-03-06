'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Utensils, BedDouble, Table2, Calendar, Users,
  MessageSquare, Image, BookOpen, Star, Plane, Coins,
  ChevronRight, Menu, X, LogOut, Zap,
} from 'lucide-react'
import { adminSignOut, getAdminSession } from '@/lib/supabase-admin-client'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Utensils, label: 'Menu', href: '/admin/menu' },
  { icon: BedDouble, label: 'Rooms', href: '/admin/rooms' },
  { icon: Table2, label: 'Tables', href: '/admin/tables' },
  { icon: MessageSquare, label: 'Enquiries', href: '/admin/enquiries' },
  { icon: Calendar, label: 'Calendar', href: '/admin/calendar' },
  { icon: Star, label: 'Testimonials', href: '/admin/testimonials' },
  { icon: BookOpen, label: 'Blog', href: '/admin/blog' },
  { icon: Plane, label: 'Travel', href: '/admin/travel' },
  { icon: Image, label: 'Images', href: '/admin/images' },
  { icon: Coins, label: 'Loyalty Coins', href: '/admin/coins' },
  { icon: Users, label: 'Staff Users', href: '/admin/users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Login page has its own full layout
  const isLoginPage = pathname === '/admin/login'

  // Client-side auth guard
  useEffect(() => {
    if (isLoginPage) { setAuthChecked(true); return }
    getAdminSession().then(session => {
      if (!session) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`)
      } else {
        setAuthChecked(true)
      }
    })
  }, [pathname, isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  // Show nothing while checking auth (prevents flash of admin content)
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="w-6 h-6 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    )
  }

  async function logout() {
    await adminSignOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-60 bg-[#0f0f23] border-r border-white/5
        flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        admin-sidebar
      `}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/15 border border-[#c9a84c]/20 flex items-center justify-center">
            <span className="text-[#c9a84c] font-bold text-lg" style={{ fontFamily: 'serif' }}>S</span>
          </div>
          <div>
            <div className="text-white/90 text-sm font-semibold leading-tight">Sharda Palace</div>
            <div className="text-white/30 text-[10px]">Management Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white/30 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/15'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            View Public Website
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-[#0f0f23]/80 border-b border-white/5 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/40 hover:text-white/70">
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-white/40 text-sm capitalize">
            {pathname.split('/').filter(Boolean).join(' › ')}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/30 text-xs">Connected</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
