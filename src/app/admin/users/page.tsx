'use client'
import { useEffect, useState, useCallback } from 'react'
import { Users, Plus, X, Save, Shield, User } from 'lucide-react'

interface AdminUser { id: string; username: string; display_name?: string; role: string; is_active: boolean; last_login?: string }

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ username: '', display_name: '', password: '', role: 'staff' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/users')
    if (r.ok) { const d = await r.json(); setUsers(d.users ?? []) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!form.username || !form.password) { setError('Username and password required'); return }
    setSaving(true); setError('')
    const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { setAdding(false); setForm({ username: '', display_name: '', password: '', role: 'staff' }); load() }
    else { const d = await r.json(); setError(d.error ?? 'Failed to create user') }
    setSaving(false)
  }

  const toggleActive = async (id: string, is_active: boolean) => {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: !is_active }) })
    load()
  }

  const roleStyle: Record<string, string> = {
    superadmin: 'bg-red-500/15 text-red-400', admin: 'bg-purple-500/15 text-purple-400',
    manager: 'bg-blue-500/15 text-blue-400', staff: 'bg-white/10 text-white/40', waiter: 'bg-teal-500/15 text-teal-400',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-[#c9a84c]" /> Staff Users</h1>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>
      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className={`flex items-center gap-3 p-4 rounded-xl border border-white/5 transition-opacity ${u.is_active ? '' : 'opacity-40'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${roleStyle[u.role] ?? 'bg-white/10 text-white/40'}`}>
                {u.role === 'superadmin' || u.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-medium">{u.display_name ?? u.username}</p>
                <p className="text-white/30 text-xs">@{u.username}{u.last_login ? ` · Last login ${new Date(u.last_login).toLocaleDateString()}` : ''}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${roleStyle[u.role] ?? 'bg-white/10 text-white/40'}`}>{u.role}</span>
              {u.role !== 'superadmin' && (
                <button onClick={() => toggleActive(u.id, u.is_active)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors ${u.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                  {u.is_active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {adding && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Add Staff User</h2>
              <button onClick={() => { setAdding(false); setError('') }} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {[['username','Username'],['display_name','Display Name (optional)'],['password','Password']].map(([k,ph]) => (
              <input key={k} type={k === 'password' ? 'password' : 'text'} value={(form as Record<string,string>)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={ph}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            ))}
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
              {['admin','manager','staff','waiter'].map(r => <option key={r}>{r}</option>)}
            </select>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setAdding(false); setError('') }} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
