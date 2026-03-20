'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { adminSignIn, adminSignOut, getAdminSession } from '@/lib/supabase-admin-client'

const HOTEL_NAME = process.env.NEXT_PUBLIC_HOTEL_NAME || 'Admin Portal'
const TENANT     = process.env.NEXT_PUBLIC_TENANT_ID  || 'sharda'
const HOTEL_INITIAL = HOTEL_NAME.charAt(0).toUpperCase()

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState(() => {
    // Show error if redirected from admin layout due to wrong tenant
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('error') === 'wrong_tenant') return `This account does not have access to ${HOTEL_NAME}.`
    }
    return ''
  })
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      // Email convention: username@tenant-id.local
      // Superadmin uses: superadmin@app.local
      const username = form.username.trim().toLowerCase()
      const email = username.includes('@') ? username
        : username === 'superadmin' ? 'superadmin@app.local'
        : `${username}@${TENANT}.local`
      await adminSignIn(email, form.password)

      // ── Tenant guard ──────────────────────────────────────────
      // After login, verify the user belongs to THIS tenant (or is superadmin).
      // This prevents e.g. raj@test.com (tenant_id=raj-darbar) from accessing
      // the Sharda admin panel.
      const session = await getAdminSession()
      const meta = session?.user?.user_metadata ?? {}
      const userTenant = meta.tenant_id as string | undefined
      const isSuperAdmin = meta.role === 'superadmin'

      if (!isSuperAdmin && userTenant && userTenant !== TENANT) {
        // Wrong tenant — sign them out immediately and show error
        await adminSignOut()
        setError(`Access denied: this account belongs to "${userTenant}", not "${TENANT}".`)
        return
      }
      // ─────────────────────────────────────────────────────────

      router.push(params.get('next') || '/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_5%,transparent)_0%,transparent_70%)]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--primary)] text-3xl font-bold" style={{ fontFamily: 'serif' }}>{HOTEL_INITIAL}</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            {HOTEL_NAME}
          </h1>
          <p className="text-white/30 text-sm mt-1">Admin &amp; Management Portal</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Username</label>
              <input
                required
                type="text"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="your username"
                autoComplete="username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[var(--primary)]/40 placeholder-white/20"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Password</label>
              <div className="relative">
                <input
                  required
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[var(--primary)]/40 placeholder-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] hover:opacity-90 disabled:opacity-60 text-[var(--bg-deep)] font-bold rounded-xl transition-opacity"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Sign in with your admin username and password.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)] text-white/30">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
