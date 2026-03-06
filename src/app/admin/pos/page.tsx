'use client'
import Dexie, { type Table } from 'dexie'
import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, Printer, Wifi, WifiOff, RefreshCw, Search, BarChart2, X } from 'lucide-react'
import { adminListAll, adminInsert } from '@/lib/supabase-admin-client'
import { useSiteConfig } from '@/lib/use-site-config'

/* ─── Dexie DB ─── */
interface IOrder { id?: number; order_number: string; order_type: 'dine-in'|'takeaway'|'delivery'; table_name?: string; items: IOrderItem[]; subtotal: number; cgst: number; sgst: number; total: number; payment_mode: string; status: 'pending'|'paid'|'cancelled'; created_at: string; synced: boolean }
interface IOrderItem { item_id: string; item_name: string; price: number; quantity: number; tax_rate: number; category: string }
interface IMenuItem { id: string; name: string; price: number; category: string; is_veg: boolean; tax_rate: number; is_active: boolean }

class PosDB extends Dexie {
  orders!: Table<IOrder>
  menuCache!: Table<IMenuItem>
  constructor() { super('ShardaPOS'); this.version(1).stores({ orders: '++id,status,synced,created_at', menuCache: 'id' }) }
}
const db = new PosDB()

/* ─── Helpers ─── */
const genOrderNo = () => `SP-${Date.now().toString(36).toUpperCase()}`
const TAX_LABEL = { 0: 'No GST', 5: '5%', 12: '12%', 18: '18%' } as Record<number, string>

const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Split', 'Credit/Room'] as const
const ORDER_TYPES = ['dine-in', 'takeaway', 'delivery'] as const

export default function POSPage() {
  const { config } = useSiteConfig()
  const [menu, setMenu] = useState<IMenuItem[]>([])
  const [cart, setCart] = useState<IOrderItem[]>([])
  const [orderType, setOrderType] = useState<typeof ORDER_TYPES[number]>('dine-in')
  const [tableName, setTableName] = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastBill, setLastBill] = useState<IOrder | null>(null)
  const [saving, setSaving] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<{ count: number; revenue: number; byMode: Record<string, number>; topItems: { name: string; qty: number; amount: number }[] } | null>(null)

  /* ─── Load menu ─── */
  const loadMenu = useCallback(async () => {
    const cached = await db.menuCache.toArray()
    if (cached.length) setMenu(cached)
    if (navigator.onLine) {
      try {
        const data = await adminListAll('menu_items', 'sort_order')
        const items: IMenuItem[] = (data as IMenuItem[]).filter((i: IMenuItem) => i.is_active)
        await db.menuCache.clear(); await db.menuCache.bulkPut(items); setMenu(items)
      } catch { /* empty */ }
    }
  }, [])

  const loadPending = useCallback(async () => {
    const n = await db.orders.where('synced').equals(0).count()
    setPendingCount(n)
  }, [])

  useEffect(() => {
    loadMenu(); loadPending()
    const onOnline = () => { setIsOnline(true); syncOrders() }
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [loadMenu, loadPending]) // eslint-disable-line

  /* ─── Sync ─── */
  const syncOrders = useCallback(async () => {
    const unsynced = await db.orders.where('synced').equals(0).toArray()
    if (!unsynced.length) return
    try {
      for (const o of unsynced) {
        await adminInsert('pos_orders', { order_number: o.order_number, order_type: o.order_type, table_name: o.table_name, items: o.items, subtotal: o.subtotal, cgst: o.cgst, sgst: o.sgst, total: o.total, payment_mode: o.payment_mode, status: o.status, created_at: o.created_at })
        if (o.id !== undefined) await db.orders.update(o.id, { synced: true })
      }
      loadPending()
    } catch { /* empty */ }
  }, [loadPending])

  /* ─── Cart ops ─── */
  const addItem = (item: IMenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item_id === item.id)
      if (existing) return prev.map(c => c.item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { item_id: item.id, item_name: item.name, price: item.price, quantity: 1, tax_rate: item.tax_rate, category: item.category }]
    })
  }
  const updateQty = (id: string, delta: number) => setCart(prev => prev.map(c => c.item_id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0))
  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.item_id !== id))
  const clearCart = () => setCart([])

  /* ─── Totals ─── */
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0)
  const cgst = cart.reduce((s, c) => s + (c.price * c.quantity * c.tax_rate) / 200, 0)
  const sgst = cgst
  const total = subtotal + cgst + sgst

  /* ─── Place order ─── */
  const placeOrder = async () => {
    if (!cart.length) return
    setSaving(true)
    const order: IOrder = {
      order_number: genOrderNo(), order_type: orderType, table_name: tableName,
      items: cart, subtotal, cgst, sgst, total, payment_mode: paymentMode,
      status: 'paid', created_at: new Date().toISOString(), synced: false
    }
    await db.orders.add(order)
    setLastBill(order)
    clearCart(); setTableName('')
    if (navigator.onLine) syncOrders()
    else loadPending()
    setSaving(false)
  }

  /* ─── Print ─── */
  const printBill = () => {
    const w = window.open('', '_blank', 'width=420,height=750')
    if (!w || !lastBill) return
    const hotelName = config.hotel_name || 'SHARDA PALACE'
    const gstNo     = config.gst_number || '09XXXXXXXXXXXXX'
    const address   = config.address    || 'Bijnor, Uttar Pradesh'
    const phone     = config.phone      || ''
    const itemRows  = lastBill.items.map(i => `
      <tr>
        <td style="padding:3px 0;vertical-align:top;">${i.item_name}</td>
        <td style="text-align:center;padding:3px 4px;white-space:nowrap;">x${i.quantity}</td>
        <td style="text-align:right;padding:3px 0;white-space:nowrap;">₹${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`).join('')
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bill – ${lastBill.order_number}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #111; background:#fff; width:320px; margin:0 auto; padding:12px; }
  .center { text-align:center; }
  .hotel-name { font-size:18px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; }
  .tagline { font-size:10px; color:#555; margin-top:2px; }
  .addr { font-size:10px; color:#444; margin-top:4px; line-height:1.5; }
  .divider { border:none; border-top:1px dashed #999; margin:8px 0; }
  .divider-solid { border:none; border-top:1px solid #333; margin:8px 0; }
  .order-meta { font-size:11px; color:#444; margin:4px 0; }
  .order-meta span { font-weight:bold; color:#111; }
  table.items { width:100%; border-collapse:collapse; margin:6px 0; }
  table.items th { font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#666; padding:2px 0; border-bottom:1px dashed #ccc; }
  table.items td { font-size:12px; }
  table.totals { width:100%; border-collapse:collapse; margin:4px 0; }
  table.totals td { padding:2px 0; font-size:12px; }
  table.totals td:last-child { text-align:right; }
  .total-row td { font-size:14px; font-weight:bold; padding-top:5px; border-top:1px solid #333; }
  .payment-row td { font-size:11px; color:#555; padding-top:3px; }
  .badge { display:inline-block; background:#f0f0f0; border-radius:3px; padding:1px 6px; font-size:10px; }
  .footer { text-align:center; font-size:11px; color:#555; margin-top:10px; line-height:1.8; }
  @media print {
    body { width:100%; padding:0; }
    @page { margin:4mm; }
  }
</style>
</head><body>
  <div class="center">
    <div class="hotel-name">${hotelName}</div>
    <div class="addr">${address}</div>
    ${phone ? `<div class="addr">Phone: ${phone}</div>` : ''}
    <div class="addr" style="margin-top:3px;">GSTIN: <b>${gstNo}</b></div>
  </div>
  <hr class="divider-solid" style="margin-top:8px;">
  <div class="order-meta">Date: <span>${new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span></div>
  <div class="order-meta">Order: <span>${lastBill.order_number}</span></div>
  <div class="order-meta">Type: <span class="badge">${lastBill.order_type.toUpperCase()}</span>${lastBill.table_name ? ` &nbsp; Table: <span>${lastBill.table_name}</span>` : ''}</div>
  <hr class="divider">
  <table class="items">
    <thead><tr>
      <th style="text-align:left;">Item</th>
      <th style="text-align:center;">Qty</th>
      <th style="text-align:right;">Amount</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <hr class="divider">
  <table class="totals">
    <tr><td>Subtotal</td><td>₹${lastBill.subtotal.toFixed(2)}</td></tr>
    <tr><td>CGST</td><td>₹${lastBill.cgst.toFixed(2)}</td></tr>
    <tr><td>SGST</td><td>₹${lastBill.sgst.toFixed(2)}</td></tr>
    <tr class="total-row"><td>TOTAL</td><td>₹${lastBill.total.toFixed(2)}</td></tr>
    <tr class="payment-row"><td>Payment Mode</td><td>${lastBill.payment_mode}</td></tr>
  </table>
  <hr class="divider">
  <div class="footer">
    Thank you for visiting!<br/>
    <b>${hotelName}</b><br/>
    सीधा स्वागत है सलाहकार • Visit Again 🙏
  </div>
</body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  /* ─── Today summary ─── */
  const loadSummary = async () => {
    const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    // Try Supabase first for complete data
    let orders: IOrder[] = []
    if (navigator.onLine) {
      try {
        const data = await adminListAll('pos_orders', 'created_at')
        orders = (data as IOrder[]).filter(o => o.created_at?.slice(0, 10) === todayStr && o.status === 'paid')
      } catch { /* fallback to local */ }
    }
    if (!orders.length) {
      const allLocal = await db.orders.toArray()
      orders = allLocal.filter(o => o.created_at?.slice(0, 10) === todayStr && o.status === 'paid')
    }
    const count = orders.length
    const revenue = orders.reduce((s, o) => s + o.total, 0)
    const byMode: Record<string, number> = {}
    orders.forEach(o => { byMode[o.payment_mode] = (byMode[o.payment_mode] || 0) + o.total })
    const itemMap: Record<string, { qty: number; amount: number }> = {}
    orders.forEach(o => o.items.forEach(i => {
      if (!itemMap[i.item_name]) itemMap[i.item_name] = { qty: 0, amount: 0 }
      itemMap[i.item_name].qty += i.quantity
      itemMap[i.item_name].amount += i.price * i.quantity
    }))
    const topItems = Object.entries(itemMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
    setSummary({ count, revenue, byMode, topItems })
    setShowSummary(true)
  }

  /* ─── Filtered menu ─── */
  const categories = ['all', ...Array.from(new Set(menu.map(m => m.category)))]
  const filtered = menu.filter(m => {
    const matchCat = catFilter === 'all' || m.category === catFilter
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden -mx-6 -my-6">
      {/* ── Today's Summary Modal ── */}
      {showSummary && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSummary(false)}>
          <div className="bg-[#0f0f23] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-base">Today&apos;s Report</h3>
                <p className="text-white/30 text-xs">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
              </div>
              <button onClick={() => setShowSummary(false)} className="text-white/30 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>
            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                <p className="text-3xl font-bold text-white">{summary.count}</p>
                <p className="text-white/40 text-xs mt-1">Bills Today</p>
              </div>
              <div className="bg-[#c9a84c]/8 border border-[#c9a84c]/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#c9a84c]">₹{summary.revenue.toFixed(0)}</p>
                <p className="text-white/40 text-xs mt-1">Total Revenue</p>
              </div>
            </div>
            {/* Payment breakdown */}
            {Object.keys(summary.byMode).length > 0 && (
              <div className="mb-4">
                <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">By Payment Mode</p>
                <div className="space-y-1.5">
                  {Object.entries(summary.byMode).sort((a,b) => b[1]-a[1]).map(([mode, amt]) => (
                    <div key={mode} className="flex items-center justify-between">
                      <span className="text-white/60 text-xs">{mode}</span>
                      <span className="text-white text-xs font-semibold">₹{amt.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Top items */}
            {summary.topItems.length > 0 && (
              <div>
                <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">Top Items Sold</p>
                <div className="space-y-1.5">
                  {summary.topItems.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-white/60 text-xs flex-1 truncate mr-2">{item.name}</span>
                      <span className="text-white/40 text-[11px] mr-3">x{item.qty}</span>
                      <span className="text-[#c9a84c] text-xs font-semibold">₹{item.amount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {summary.count === 0 && (
              <p className="text-white/30 text-sm text-center py-4">No orders recorded today yet.</p>
            )}
          </div>
        </div>
      )}
      {/* ── Left: Menu ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
        {/* Header */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">POS Terminal</h2>
            <div className="flex items-center gap-2">
              <button onClick={loadSummary} className="flex items-center gap-1.5 text-xs text-[#c9a84c]/80 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 border border-[#c9a84c]/20 px-2.5 py-1.5 rounded-lg transition-colors">
                <BarChart2 className="w-3.5 h-3.5" /> Today
              </button>
              {isOnline ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              {pendingCount > 0 && (
                <button onClick={syncOrders} className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg hover:bg-amber-400/20 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Sync {pendingCount}
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm outline-none focus:border-[#c9a84c]/30" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${catFilter === c ? 'bg-[#c9a84c] text-black font-semibold' : 'bg-white/5 text-white/50 hover:text-white'}`}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 content-start">
          {filtered.map(item => {
            const inCart = cart.find(c => c.item_id === item.id)
            return (
              <button key={item.id} onClick={() => addItem(item)}
                className={`p-3 rounded-xl border text-left transition-all ${inCart ? 'border-[#c9a84c]/40 bg-[#c9a84c]/8' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <p className="text-white/90 text-xs font-medium leading-tight line-clamp-2">{item.name}</p>
                  <span className={`w-3 h-3 rounded-sm border shrink-0 mt-0.5 ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                    <span className={`block w-full h-full rounded-sm m-0.5 ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: '60%', height: '60%', marginLeft: '20%', marginTop: '20%' }} />
                  </span>
                </div>
                <p className="text-[#c9a84c] text-sm font-bold">₹{item.price}</p>
                <p className="text-white/25 text-[10px]">{TAX_LABEL[item.tax_rate] ?? `${item.tax_rate}%`}</p>
                {inCart && <p className="text-[#c9a84c] text-[10px] mt-1">x{inCart.quantity} in cart</p>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div className="w-80 flex flex-col border-l border-white/5 bg-black/30">
        {/* Order config */}
        <div className="p-4 border-b border-white/5 space-y-2">
          <div className="flex gap-1">
            {ORDER_TYPES.map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${orderType === t ? 'bg-[#c9a84c] text-black font-semibold' : 'bg-white/5 text-white/50'}`}>
                {t === 'dine-in' ? 'Dine In' : t === 'takeaway' ? 'Takeaway' : 'Delivery'}
              </button>
            ))}
          </div>
          {orderType === 'dine-in' && (
            <input value={tableName} onChange={e => setTableName(e.target.value)} placeholder="Table name (e.g. T-4)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#c9a84c]/30" />
          )}
        </div>
        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/20">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.item_id} className="flex items-center gap-2 p-2 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs truncate">{item.item_name}</p>
                <p className="text-[#c9a84c] text-xs">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.item_id, -1)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center">
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="w-5 text-center text-white text-xs">{item.quantity}</span>
                <button onClick={() => updateQty(item.item_id, 1)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center">
                  <Plus className="w-2.5 h-2.5" />
                </button>
                <button onClick={() => removeItem(item.item_id)} className="w-5 h-5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center ml-1">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Totals + payment */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-white/5 space-y-3">
            <div className="space-y-1 text-xs text-white/50">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>CGST</span><span>₹{cgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>SGST</span><span>₹{sgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-white/10">
                <span>TOTAL</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            {/* Payment mode */}
            <div className="flex flex-wrap gap-1">
              {PAYMENT_MODES.map(m => (
                <button key={m} onClick={() => setPaymentMode(m)}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${paymentMode === m ? 'bg-[#c9a84c] text-black font-semibold' : 'bg-white/5 text-white/50'}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={clearCart} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors">
                Clear
              </button>
              <button onClick={placeOrder} disabled={saving}
                className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black font-bold text-sm hover:bg-[#d4af5a] transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : `Pay ₹${total.toFixed(0)}`}
              </button>
            </div>
          </div>
        )}
        {/* Last bill */}
        {lastBill && (
          <div className="p-3 border-t border-white/5 flex items-center gap-2 bg-green-500/5">
            <div className="flex-1">
              <p className="text-green-400 text-xs font-medium">Bill #{lastBill.order_number}</p>
              <p className="text-white/40 text-[10px]">₹{lastBill.total.toFixed(0)} · {lastBill.payment_mode}</p>
            </div>
            <button onClick={printBill} className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
