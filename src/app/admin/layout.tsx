'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Utensils, BedDouble, Table2, Calendar, Users,
  MessageSquare, Image, BookOpen, Star, Plane, Coins, Settings,
  ChevronRight, Menu, X, LogOut, Zap, ExternalLink, BarChart2,
  ShieldCheck, ChevronDown, Building2, PartyPopper,
} from 'lucide-react'
import { getFeatures } from '@/lib/features'
import { getSupabaseAdmin, adminSignOut, getActiveTenant, setActiveTenant, TENANT } from '@/lib/supabase-admin-client'

const f = getFeatures()

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/admin' },
  f.pos    && { icon: Zap,         label: 'POS Terminal',   href: '/admin/pos' },
  f.pos    && { icon: BarChart2,   label: 'Sales Report',   href: '/admin/sales' },
  { icon: Utensils,      label: 'Menu',           href: '/admin/menu' },
  f.hotel  && { icon: BedDouble,  label: 'Rooms',          href: '/admin/rooms' },
  { icon: Table2,        label: 'Tables',         href: '/admin/tables' },
  { icon: MessageSquare, label: 'Enquiries',      href: '/admin/enquiries' },
  f.events && { icon: PartyPopper, label: 'Events & Venues', href: '/admin/events' },
  { icon: Calendar,      label: 'Calendar',       href: '/admin/calendar' },
  { icon: Star,          label: 'Testimonials',   href: '/admin/testimonials' },
  f.blog   && { icon: BookOpen,   label: 'Blog',           href: '/admin/blog' },
  f.travel && { icon: Plane,      label: 'Travel',         href: '/admin/travel' },
  { icon: Image,         label: 'Images',         href: '/admin/images' },
  { icon: Settings,      label: 'Site Config',    href: '/admin/config' },
  f.coins  && { icon: Coins,      label: 'Loyalty Coins',  href: '/admin/coins' },
  { icon: Users,         label: 'Staff Users',    href: '/admin/users' },
].filter(Boolean) as { icon: React.ElementType; label: string; href: string }[]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [activeTenant, setActiveTenantState] = useState<string>('')
  const [tenants, setTenants] = useState<string[]>([])
  const [tenantDropOpen, setTenantDropOpen] = useState(false)
  const [switchingTenant, setSwitchingTenant] = useState(false)

  const isLoginPage = pathname.startsWith('/admin/login')

  useEffect(() => {
    if (isLoginPage) { setAuthChecked(true); return }

    const sb = getSupabaseAdmin()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      const meta = session.user.user_metadata ?? {}
      const isSA = meta.role === 'superadmin'

      // ── Tenant guard ──────────────────────────────────────────────────
      // If user has a tenant_id that doesn't match THIS site, kick them out.
      const userTenant = meta.tenant_id as string | undefined
      if (!isSA && userTenant && userTenant !== TENANT) {
        await adminSignOut()
        router.replace(`/admin/login?error=wrong_tenant`)
        return
      }
      // ─────────────────────────────────────────────────────────────────

      setIsSuperAdmin(isSA)

      const currentTenant = getActiveTenant()
      setActiveTenantState(currentTenant)
      setAuthChecked(true)

      // Superadmin: fetch all tenant IDs from site_config
      if (isSA) {
        sb.from('site_config').select('tenant_id').eq('config_key', 'hotel_name')
          .then(({ data }) => {
            const list = [...new Set((data ?? []).map((r: { tenant_id: string }) => r.tenant_id))]
            setTenants(list)
          })
      }
    }).catch(() => {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`)
    })
  }, [pathname, isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="w-6 h-6 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    )
  }

  async function logout() {
    await adminSignOut()
    router.push('/admin/login')
  }

  function switchTenant(tenant: string) {
    setSwitchingTenant(true)
    setTenantDropOpen(false)
    setActiveTenant(tenant)           // saves to localStorage
    setActiveTenantState(tenant)
    setSwitchingTenant(false)
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-60 bg-[var(--bg-deep)] border-r border-white/5
        flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        admin-sidebar
      `}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
              <span className="text-[var(--primary)] font-bold text-lg" style={{ fontFamily: 'serif' }}>
                {(process.env.NEXT_PUBLIC_HOTEL_NAME || 'S')[0]}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-white/90 text-sm font-semibold leading-tight truncate">
                {process.env.NEXT_PUBLIC_HOTEL_NAME || 'Admin Panel'}
              </div>
              <div className="text-white/30 text-[10px]">Management Portal</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white/30 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Superadmin tenant switcher */}
          {isSuperAdmin && (
            <div className="mt-3 relative">
              <button
                onClick={() => setTenantDropOpen(o => !o)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--primary)]/8 border border-[var(--primary)]/20 text-xs text-[var(--primary)] hover:bg-[var(--primary)]/15 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-left font-medium truncate">
                  {switchingTenant ? 'Switching…' : (activeTenant || 'Select tenant')}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${tenantDropOpen ? 'rotate-180' : ''}`} />
              </button>
              {tenantDropOpen && tenants.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[var(--bg-card)] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                  <div className="px-3 py-1.5 text-[10px] text-white/30 uppercase tracking-wider border-b border-white/5">
                    Switch tenant
                  </div>
                  {tenants.map(t => (
                    <button
                      key={t}
                      onClick={() => switchTenant(t)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                        t === activeTenant
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Building2 className="w-3 h-3 shrink-0" />
                      {t}
                      {t === activeTenant && <span className="ml-auto text-[10px] text-[var(--primary)]/60">active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/15'
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
            <ExternalLink className="w-3.5 h-3.5" />
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
        <header className="h-14 shrink-0 bg-[var(--bg-deep)]/80 border-b border-white/5 flex items-center px-4 gap-3">
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
