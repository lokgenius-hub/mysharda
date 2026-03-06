'use client'
import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { adminList } from '@/lib/supabase-admin-client'

interface Config { spend_per_coin: number; coin_value: number; min_redeem: number }

export default function CoinsPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [phone, setPhone] = useState('')
  const [profile, setProfile] = useState<{name?:string;balance:number}|null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    adminList('loyalty_coins_config', { limit: 1 }).then(data => {
      if (data.length) setConfig(data[0] as Config)
    }).catch(() => { /* empty */ })
  }, [])

  const search = async () => {
    if (!phone) return; setSearching(true)
    try {
      const data = await adminList('customer_profiles', { column: 'phone', value: phone, limit: 1 })
      setProfile(data.length ? (data[0] as { name?: string; balance: number }) : null)
    } catch { setProfile(null) }
    setSearching(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white flex items-center gap-2"><Coins className="w-5 h-5 text-[#c9a84c]" /> Loyalty Coins</h1>
      {config && (
        <div className="grid grid-cols-3 gap-3">
          {[
            ['₹' + config.spend_per_coin, '= 1 Coin earned'],
            ['1 Coin', '= ₹' + config.coin_value + ' discount'],
            [config.min_redeem + ' coins', 'minimum to redeem'],
          ].map(([v, l]) => (
            <div key={v} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
              <p className="text-[#c9a84c] font-bold text-xl">{v}</p>
              <p className="text-white/40 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      )}
      <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
        <p className="text-white/60 text-sm font-medium">Check Customer Balance</p>
        <div className="flex gap-2">
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Customer phone number"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
          <button onClick={search} disabled={searching} className="px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors disabled:opacity-50">
            {searching ? '...' : 'Search'}
          </button>
        </div>
        {profile !== null && (
          <div className={`p-3 rounded-xl ${profile ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
            {profile ? (
              <>
                <p className="text-white/80 text-sm font-medium">{profile.name ?? 'Customer'}</p>
                <p className="text-[#c9a84c] text-2xl font-bold">{profile.balance} coins</p>
                <p className="text-white/30 text-xs">= ₹{(profile.balance * (config?.coin_value ?? 1)).toFixed(0)} discount value</p>
              </>
            ) : (
              <p className="text-red-400 text-sm">No loyalty account found for this number</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
