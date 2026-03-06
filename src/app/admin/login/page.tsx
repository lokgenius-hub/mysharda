'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [form, setForm] = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      router.push(params.get('next') || '/admin')
      router.refresh()
    } catch {
      setError('Network error. Is the server running on this computer?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f23] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#c9a84c08_0%,transparent_70%)]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#c9a84c] text-3xl font-bold" style={{ fontFamily: 'serif' }}>S</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Sharda Palace
          </h1>
          <p className="text-white/30 text-sm mt-1">Admin & Management Portal</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Username</label>
              <input
                required
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="superadmin"
                autoComplete="username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20"
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
                  className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20"
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-60 text-[#0f0f23] font-bold rounded-xl transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0f0f23]/30 border-t-[#0f0f23] rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          This portal is only accessible from the hotel&apos;s local network.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0f0f23] text-white/30">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
