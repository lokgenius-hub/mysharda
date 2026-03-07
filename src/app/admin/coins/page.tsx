'use client'
import { useEffect, useState } from 'react'
import {
  Coins, Search, PlusCircle, Loader2, CheckCircle2, User,
  ArrowUpCircle, ArrowDownCircle, Send, IndianRupee, X,
} from 'lucide-react'
import { getSupabaseAdmin } from '@/lib/supabase-admin-client'

interface CoinConfig { id: string; spend_per_coin: number; coin_value: number; min_redeem: number }
interface Profile {
  id: string; phone: string; name: string | null; coins: number;
  created_at: string; total_earned?: number; total_redeemed?: number
}
interface Transaction {
  id: string; type: 'credit' | 'debit'; coins: number; note: string | null; created_at: string
}

// ─── helpers ──────────────────────────────────────────────────────
const sb = () => getSupabaseAdmin()

async function getCoinConfig(): Promise<CoinConfig | null> {
  const { data } = await sb().from('coin_config').select('*').limit(1).single()
  return data ?? null
}

async function getOrCreateProfile(phone: string, name?: string): Promise<Profile | null> {
  const { data: existing } = await sb().from('coin_profiles').select('*').eq('phone', phone).maybeSingle()
  if (existing) {
    // update name if provided and not set
    if (name && !existing.name) {
      await sb().from('coin_profiles').update({ name }).eq('phone', phone)
      existing.name = name
    }
    return existing as Profile
  }
  // create
  const { data: created, error } = await sb().from('coin_profiles')
    .insert({ phone, name: name || null, coins: 0 })
    .select().maybeSingle()
  if (error) return null
  return created as Profile
}

async function fetchProfile(phone: string): Promise<Profile | null> {
  const { data } = await sb().from('coin_profiles').select('*').eq('phone', phone).maybeSingle()
  return data ?? null
}

async function fetchTransactions(phone: string, profileId: string): Promise<Transaction[]> {
  const { data } = await sb().from('coin_transactions')
    .select('*').eq('profile_id', profileId)
    .order('created_at', { ascending: false }).limit(20)
  return (data ?? []) as Transaction[]
}

async function addCoins(phone: string, billAmount: number, name: string | undefined, config: CoinConfig) {
  const coinsEarned = Math.floor(billAmount / config.spend_per_coin)
  if (coinsEarned <= 0) throw new Error(`Bill must be at least ₹${config.spend_per_coin} to earn coins`)
  const profile = await getOrCreateProfile(phone, name)
  if (!profile) throw new Error('Failed to create/fetch customer profile')
  const newBalance = profile.coins + coinsEarned
  await sb().from('coin_profiles').update({ coins: newBalance, updated_at: new Date().toISOString() }).eq('phone', phone)
  await sb().from('coin_transactions').insert({ profile_id: profile.id, type: 'credit', coins: coinsEarned, note: `Bill ₹${billAmount}` })
  return { coinsEarned, newBalance, profile: { ...profile, coins: newBalance } }
}

async function redeemCoins(phone: string, coinsToRedeem: number, config: CoinConfig) {
  if (coinsToRedeem < config.min_redeem) throw new Error(`Minimum ${config.min_redeem} coins required to redeem`)
  const profile = await fetchProfile(phone)
  if (!profile) throw new Error('Customer not found')
  if (profile.coins < coinsToRedeem) throw new Error(`Insufficient coins. Current balance: ${profile.coins}`)
  const newBalance = profile.coins - coinsToRedeem
  await sb().from('coin_profiles').update({ coins: newBalance, updated_at: new Date().toISOString() }).eq('phone', phone)
  await sb().from('coin_transactions').insert({ profile_id: profile.id, type: 'debit', coins: coinsToRedeem, note: `Redeemed ₹${(coinsToRedeem * config.coin_value).toFixed(0)} discount` })
  return { coinsRedeemed: coinsToRedeem, newBalance, discountValue: coinsToRedeem * config.coin_value }
}

// ═══ MAIN PAGE ══════════════════════════════════════════════════════
export default function AdminCoinsPage() {
  const [tab, setTab] = useState<'add' | 'balance'>('add')
  const [config, setConfig] = useState<CoinConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)

  useEffect(() => {
    getCoinConfig().then(c => { setConfig(c); setConfigLoading(false) })
  }, [])

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#c9a84c] mb-1 flex items-center gap-2">
          <Coins className="w-5 h-5" /> Sharda Coins — Loyalty Counter
        </h1>
        <p className="text-white/40 text-sm">Award coins on every purchase, or check/redeem customer balance.</p>
      </div>

      {/* Config pills */}
      {!configLoading && config && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            [`₹${config.spend_per_coin}`, '= 1 Coin earned'],
            ['1 Coin', `= ₹${config.coin_value} discount`],
            [`${config.min_redeem}`, 'min coins to redeem'],
          ].map(([v, l]) => (
            <div key={v} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-center">
              <p className="text-[#c9a84c] font-bold text-lg">{v}</p>
              <p className="text-white/40 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('add')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${tab === 'add' ? 'bg-[#c9a84c] text-black' : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'}`}>
          <PlusCircle className="w-4 h-4" /> Add Coins
        </button>
        <button onClick={() => setTab('balance')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${tab === 'balance' ? 'bg-[#c9a84c] text-black' : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'}`}>
          <Search className="w-4 h-4" /> Check Balance
        </button>
      </div>

      {configLoading ? (
        <div className="flex items-center justify-center py-12 text-white/30">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading config…
        </div>
      ) : !config ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          Could not load coin configuration. Make sure the <code className="font-mono text-xs bg-red-500/10 px-1 rounded">coin_config</code> table has a row in Supabase.
        </div>
      ) : tab === 'add' ? (
        <AddCoinsTab config={config} />
      ) : (
        <CheckBalanceTab config={config} />
      )}
    </div>
  )
}

// ═══ ADD COINS TAB ══════════════════════════════════════════════
function AddCoinsTab({ config }: { config: CoinConfig }) {
  const [phone, setPhone] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ coinsEarned: number; newBalance: number; billAmount: number; phone: string; name: string | null } | null>(null)

  const handleSubmit = async () => {
    if (phone.length !== 10 || !billAmount || Number(billAmount) <= 0) return
    setLoading(true); setError('')
    try {
      const r = await addCoins(phone, Number(billAmount), customerName || undefined, config)
      setResult({ coinsEarned: r.coinsEarned, newBalance: r.newBalance, billAmount: Number(billAmount), phone, name: r.profile.name })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add coins')
    } finally { setLoading(false) }
  }

  const sendWhatsApp = () => {
    if (!result) return
    const msg = `🏨 *Sharda Palace Hotel & Banquet*\n\nDear ${result.name || 'Customer'},\n\n✅ *${result.coinsEarned} Sharda Coins* added!\n\n💰 Bill Amount: ₹${result.billAmount}\n🪙 Coins Earned: +${result.coinsEarned}\n📊 Total Balance: ${result.newBalance} coins\n\nKeep earning on every visit! 🌟\nThank you for choosing Sharda Palace! 🙏`
    window.open(`https://wa.me/91${result.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const reset = () => { setPhone(''); setBillAmount(''); setCustomerName(''); setResult(null); setError('') }

  if (result) return (
    <div className="p-6 rounded-2xl border border-green-500/20 bg-green-500/5 text-center space-y-4">
      <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
      <h3 className="text-lg font-bold text-green-400">Coins Added Successfully!</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-black/20 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Bill Amount</p>
          <p className="text-white font-bold text-lg flex items-center justify-center gap-1"><IndianRupee className="w-4 h-4" />{result.billAmount}</p>
        </div>
        <div className="bg-black/20 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Coins Earned</p>
          <p className="text-[#c9a84c] font-bold text-lg flex items-center justify-center gap-1"><Coins className="w-4 h-4" />+{result.coinsEarned}</p>
        </div>
      </div>
      <div className="bg-black/20 rounded-xl p-4">
        <p className="text-white/40 text-xs mb-1">New Balance</p>
        <p className="text-[#c9a84c] font-bold text-3xl">{result.newBalance} coins</p>
        <p className="text-white/30 text-xs mt-1">= ₹{(result.newBalance * config.coin_value).toFixed(0)} discount value</p>
      </div>
      <button onClick={sendWhatsApp}
        className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#20BD5A]">
        <Send className="w-4 h-4" /> Send on WhatsApp
      </button>
      <button onClick={reset}
        className="w-full py-2.5 bg-white/5 text-white/50 rounded-xl text-sm border border-white/10 hover:border-white/20">
        Add Another Purchase
      </button>
    </div>
  )

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="w-4 h-4 text-[#c9a84c]" />
        <h3 className="text-[#c9a84c] font-bold text-sm">Award Coins for Purchase</h3>
      </div>
      <div>
        <label className="text-white/50 text-xs mb-1 block">Phone Number *</label>
        <input type="tel" inputMode="numeric" value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit phone number" maxLength={10}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg tracking-wider font-mono focus:border-[#c9a84c]/40 focus:outline-none" />
        {phone && phone.length < 10 && <p className="text-white/25 text-xs mt-1">{10 - phone.length} digits remaining</p>}
      </div>
      <div>
        <label className="text-white/50 text-xs mb-1 block">Customer Name (optional)</label>
        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
          placeholder="e.g. Rahul Sharma"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#c9a84c]/40 focus:outline-none" />
      </div>
      <div>
        <label className="text-white/50 text-xs mb-1 block">Bill Amount (₹) *</label>
        <input type="number" inputMode="numeric" value={billAmount}
          onChange={e => setBillAmount(e.target.value)} placeholder={`e.g. 500 (min ₹${config.spend_per_coin})`} min={1}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg focus:border-[#c9a84c]/40 focus:outline-none" />
        {billAmount && Number(billAmount) >= config.spend_per_coin && (
          <p className="text-[#c9a84c]/70 text-xs mt-1">
            Will earn: <strong className="text-[#c9a84c]">{Math.floor(Number(billAmount) / config.spend_per_coin)} coins</strong>
          </p>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-sm">
          <X className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      <button onClick={handleSubmit}
        disabled={loading || phone.length !== 10 || !billAmount || Number(billAmount) < config.spend_per_coin}
        className="w-full py-3 bg-[#c9a84c] text-black rounded-xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#d4af5a]">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Coins className="w-4 h-4" /> Add Coins</>}
      </button>
    </div>
  )
}

// ═══ CHECK BALANCE TAB ══════════════════════════════════════════
function CheckBalanceTab({ config }: { config: CoinConfig }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searched, setSearched] = useState(false)
  const [redeemAmt, setRedeemAmt] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemError, setRedeemError] = useState('')
  const [redeemSuccess, setRedeemSuccess] = useState('')

  const search = async () => {
    if (phone.length !== 10) return
    setLoading(true); setSearched(false)
    const p = await fetchProfile(phone)
    setProfile(p)
    if (p) {
      const txs = await fetchTransactions(phone, p.id)
      setTransactions(txs)
    }
    setSearched(true); setLoading(false)
    setRedeemError(''); setRedeemSuccess('')
  }

  const redeem = async () => {
    if (!profile || !redeemAmt) return
    setRedeeming(true); setRedeemError(''); setRedeemSuccess('')
    try {
      const r = await redeemCoins(phone, Number(redeemAmt), config)
      setRedeemSuccess(`✅ Redeemed ${r.coinsRedeemed} coins = ₹${r.discountValue.toFixed(0)} discount`)
      setRedeemAmt('')
      // refresh profile
      const p = await fetchProfile(phone)
      if (p) { setProfile(p); setTransactions(await fetchTransactions(phone, p.id)) }
    } catch (e) {
      setRedeemError(e instanceof Error ? e.message : 'Redeem failed')
    } finally { setRedeeming(false) }
  }

  const sendWhatsApp = () => {
    if (!profile) return
    const msg = `🏨 *Sharda Palace Hotel & Banquet*\n\nDear ${profile.name || 'Customer'},\n\n📊 *Your Sharda Coins Balance*\n\n🪙 Current Balance: ${profile.coins} coins\n💰 Value: ₹${(profile.coins * config.coin_value).toFixed(0)} discount\n\nVisit us to earn more! 🌟\n🙏 Thank you for your loyalty!`
    window.open(`https://wa.me/91${profile.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-[#c9a84c]" />
          <h3 className="text-[#c9a84c] font-bold text-sm">Check Customer Balance</h3>
        </div>
        <div className="flex gap-2">
          <input type="tel" inputMode="numeric" value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit phone number" maxLength={10}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg tracking-wider font-mono focus:border-[#c9a84c]/40 focus:outline-none" />
          <button onClick={search} disabled={loading || phone.length !== 10}
            className="px-5 py-3 bg-[#c9a84c] text-black rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-[#d4af5a]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Profile found */}
      {searched && profile && (
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#c9a84c]" />
            </div>
            <div>
              <p className="text-white font-semibold">{profile.name ?? 'Customer'}</p>
              <p className="text-white/40 text-xs font-mono">{profile.phone.slice(0,5)} {profile.phone.slice(5)}</p>
            </div>
          </div>
          {/* Balance card */}
          <div className="bg-[#c9a84c]/8 border border-[#c9a84c]/20 rounded-xl p-4 text-center">
            <p className="text-white/40 text-xs mb-1">Coin Balance</p>
            <p className="text-[#c9a84c] font-bold text-4xl flex items-center justify-center gap-2">
              <Coins className="w-8 h-8" />{profile.coins}
            </p>
            <p className="text-white/30 text-xs mt-1">= ₹{(profile.coins * config.coin_value).toFixed(0)} discount value</p>
          </div>
          {/* Redeem section */}
          {profile.coins >= config.min_redeem && (
            <div className="space-y-2">
              <p className="text-white/50 text-xs font-medium">Redeem Coins</p>
              <div className="flex gap-2">
                <input type="number" inputMode="numeric" value={redeemAmt}
                  onChange={e => setRedeemAmt(e.target.value)}
                  placeholder={`Min ${config.min_redeem} coins`} min={config.min_redeem} max={profile.coins}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#c9a84c]/40" />
                <button onClick={redeem} disabled={redeeming || !redeemAmt || Number(redeemAmt) < config.min_redeem}
                  className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-sm font-bold border border-red-500/30 disabled:opacity-40 hover:bg-red-500/30">
                  {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redeem'}
                </button>
              </div>
              {redeemAmt && Number(redeemAmt) >= config.min_redeem && (
                <p className="text-white/30 text-xs">
                  Discount value: <span className="text-green-400 font-semibold">₹{(Number(redeemAmt) * config.coin_value).toFixed(0)}</span>
                </p>
              )}
              {redeemError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{redeemError}</p>}
              {redeemSuccess && <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{redeemSuccess}</p>}
            </div>
          )}
          <button onClick={sendWhatsApp}
            className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20BD5A]">
            <Send className="w-4 h-4" /> Send Balance on WhatsApp
          </button>
        </div>
      )}

      {/* Not found */}
      {searched && !profile && !loading && (
        <div className="p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 text-center">
          <p className="text-orange-400 font-medium">No customer found for this number.</p>
          <p className="text-white/30 text-xs mt-1">Add a purchase first (Add Coins tab) to create their profile.</p>
        </div>
      )}

      {/* Transactions */}
      {transactions.length > 0 && (
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  {tx.type === 'credit'
                    ? <ArrowUpCircle className="w-4 h-4 text-green-400 shrink-0" />
                    : <ArrowDownCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <div>
                    <p className="text-white/80 text-xs font-medium">{tx.type === 'credit' ? 'Earned' : 'Redeemed'}</p>
                    {tx.note && <p className="text-white/30 text-[10px]">{tx.note}</p>}
                    <p className="text-white/25 text-[10px]">
                      {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.coins}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
