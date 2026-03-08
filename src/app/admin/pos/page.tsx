'use client'
import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, Printer, Wifi, WifiOff, RefreshCw, Search, BarChart2, X, AlertCircle, Hotel, UtensilsCrossed } from 'lucide-react'
import { adminListAll, adminInsert } from '@/lib/supabase-admin-client'
import { useSiteConfig } from '@/lib/use-site-config'
import { posDb, type ILocalOrder, type IOrderItem, type IMenuItem } from '@/lib/pos-db'

// Module-level alias so the rest of the file stays unchanged
const db = posDb
type IOrder = ILocalOrder

/* ─── Helpers ─── */
const genOrderNo = () => `SP-${Date.now().toString(36).toUpperCase()}`
const TAX_LABEL = { 0: 'No GST', 5: '5%', 12: '12%', 18: '18%' } as Record<number, string>

const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Split', 'Credit/Room'] as const
const ORDER_TYPES = ['dine-in', 'takeaway', 'delivery'] as const
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const POS_MODES = ['restaurant', 'hotel'] as const

export default function POSPage() {
  const { config } = useSiteConfig()
  const [posMode, setPosMode] = useState<typeof POS_MODES[number]>('restaurant')
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
  const [syncError, setSyncError] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<{ count: number; revenue: number; byMode: Record<string, number>; topItems: { name: string; qty: number; amount: number }[] } | null>(null)
  const [mobileView, setMobileView] = useState<'menu' | 'cart'>('menu')

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
    // Sync any orders that were saved offline during previous sessions
    if (navigator.onLine) syncOrders()
    const onOnline = () => { setIsOnline(true); syncOrders() }
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [loadMenu, loadPending]) // eslint-disable-line

  /* ─── Sync ─── */
  const syncOrders = useCallback(async () => {
    const unsynced = await db.orders.where('synced').equals(0).toArray()
    if (!unsynced.length) return
    setSyncError('')
    let anyFailed = false
    for (const o of unsynced) {
      const itemSummary = o.items.map(i => `${i.item_name} x${i.quantity}`).join(', ')
      const itemCount   = o.items.reduce((s, i) => s + i.quantity, 0)
      try {
        await adminInsert('pos_orders', {
          order_number: o.order_number,
          order_type:   o.order_type,
          table_name:   o.table_name || null,
          items:        o.items,          // JSONB column (run migration-pos-items-jsonb.sql if missing)
          item_count:   itemCount,
          item_summary: itemSummary,
          subtotal:     o.subtotal,
          cgst:         o.cgst,
          sgst:         o.sgst,
          total:        o.total,
          payment_mode: o.payment_mode,
          status:       o.status,
          created_at:   o.created_at,
          synced_at:    new Date().toISOString(),
        })
        if (o.id !== undefined) await db.orders.update(o.id, { synced: true })
      } catch (err) {
        anyFailed = true
        const msg = err instanceof Error ? err.message : String(err)
        setSyncError(`Sync failed: ${msg}. Run migration-pos-items-jsonb.sql in Supabase SQL Editor.`)
        console.error('[POS sync]', err)
      }
    }
    if (!anyFailed) setSyncError('')
    loadPending()
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

  /* ─── Hotel Bill print ─── */
  const printHotelBill = (bill: { guestName: string; roomNo: string; checkIn: string; checkOut: string; nights: number; roomRate: number; extras: {desc: string; amt: number}[]; paymentMode: string; orderNumber: string }) => {
    const w = window.open('', '_blank', 'width=420,height=800')
    if (!w) return
    const hotelName = config.hotel_name || 'SHARDA PALACE'
    const address   = config.address    || 'Bijnor, Uttar Pradesh'
    const phone     = config.phone      || ''
    const gstNo     = config.gst_number || '09XXXXXXXXXXXXX'
    const roomTotal = bill.nights * bill.roomRate
    const extrasTotal = bill.extras.reduce((s, e) => s + e.amt, 0)
    const grandTotal  = roomTotal + extrasTotal
    const cgst = grandTotal * 0.06, sgst = cgst
    const finalTotal = grandTotal + cgst + sgst
    const extRows = bill.extras.map(e => `<tr><td style="padding:3px 0">${e.desc}</td><td style="text-align:right">₹${e.amt.toFixed(2)}</td></tr>`).join('')
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hotel Bill – ${bill.orderNumber}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:13px;color:#111;background:#fff;width:320px;margin:0 auto;padding:12px}.center{text-align:center}.hotel-name{font-size:18px;font-weight:bold;letter-spacing:2px;text-transform:uppercase}.addr{font-size:10px;color:#444;margin-top:4px;line-height:1.5}.divider{border:none;border-top:1px dashed #999;margin:8px 0}.divider-solid{border:none;border-top:1px solid #333;margin:8px 0}.meta{font-size:11px;color:#444;margin:4px 0}.meta span{font-weight:bold;color:#111}table{width:100%;border-collapse:collapse;margin:6px 0}table td{padding:2px 0;font-size:12px}table td:last-child{text-align:right}.total-row td{font-size:14px;font-weight:bold;padding-top:5px;border-top:1px solid #333}.footer{text-align:center;font-size:11px;color:#555;margin-top:10px;line-height:1.8}@media print{body{width:100%;padding:0}@page{margin:4mm}}</style>
</head><body>
<div class="center"><div class="hotel-name">${hotelName}</div><div class="addr">${address}</div>${phone ? `<div class="addr">Tel: ${phone}</div>` : ''}<div class="addr">GSTIN: <b>${gstNo}</b></div></div>
<hr class="divider-solid" style="margin-top:8px">
<div class="meta"><b>HOTEL FOLIO / INVOICE</b></div>
<div class="meta">Bill No: <span>${bill.orderNumber}</span></div>
<div class="meta">Date: <span>${new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div>
<hr class="divider">
<div class="meta">Guest: <span>${bill.guestName}</span></div>
<div class="meta">Room: <span>${bill.roomNo}</span></div>
<div class="meta">Check-in: <span>${bill.checkIn}</span></div>
<div class="meta">Check-out: <span>${bill.checkOut}</span></div>
<hr class="divider">
<table>
<tr><td>Room Charges (${bill.nights} night${bill.nights!==1?'s':''} × ₹${bill.roomRate.toFixed(0)})</td><td>₹${roomTotal.toFixed(2)}</td></tr>
${extRows}
<tr><td colspan="2"><hr class="divider" style="margin:4px 0"></td></tr>
<tr><td>Sub-total</td><td>₹${grandTotal.toFixed(2)}</td></tr>
<tr><td>CGST @6%</td><td>₹${cgst.toFixed(2)}</td></tr>
<tr><td>SGST @6%</td><td>₹${sgst.toFixed(2)}</td></tr>
<tr class="total-row"><td>TOTAL</td><td>₹${finalTotal.toFixed(2)}</td></tr>
<tr><td style="font-size:11px;color:#555">Payment</td><td style="font-size:11px;color:#555">${bill.paymentMode}</td></tr>
</table>
<hr class="divider">
<div class="footer">Thank you for staying!<br><b>${hotelName}</b><br>We look forward to seeing you again 🙏</div>
</body></html>`)
    w.document.close(); w.focus(); setTimeout(() => w.print(), 300)
  }

  return (
    <div className="relative flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] overflow-hidden -mx-4 lg:-mx-6 -my-4 lg:-my-6">
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
      {/* ── Mode toggle: Restaurant / Hotel (desktop overlay, now removed — moved into header) ── */}

      {/* ── Hotel Billing Panel ── */}
      {posMode === 'hotel' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <HotelBillPanel config={config} printHotelBill={printHotelBill} syncHotelBill={async (order) => {
            try { await adminInsert('pos_orders', order) } catch { /* best-effort */ }
          }} />
        </div>
      )}

      {/* ── Left: Menu ── */}
      <div className={`flex-1 flex flex-col overflow-hidden bg-black/20 ${posMode === 'hotel' ? 'hidden' : ''} ${mobileView === 'cart' ? 'hidden lg:flex' : 'flex'}`}>        
        {/* Header */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mode toggle — inline on mobile, overlay on desktop */}
              <div className="flex gap-1 bg-black/40 rounded-xl p-0.5 border border-white/10">
                <button onClick={() => setPosMode('restaurant')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${posMode === 'restaurant' ? 'bg-[#c9a84c] text-black' : 'text-white/50 hover:text-white'}`}>
                  <UtensilsCrossed className="w-3 h-3" /> <span className="hidden sm:inline">Restaurant</span>
                </button>
                <button onClick={() => setPosMode('hotel')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${posMode === 'hotel' ? 'bg-[#c9a84c] text-black' : 'text-white/50 hover:text-white'}`}>
                  <Hotel className="w-3 h-3" /> <span className="hidden sm:inline">Hotel</span>
                </button>
              </div>
            </div>
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
          {syncError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="flex-1">{syncError}</span>
              <button onClick={() => setSyncError('')} className="shrink-0 text-red-400/50 hover:text-red-400"><X className="w-3 h-3" /></button>
            </div>
          )}
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
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 content-start pb-20 lg:pb-3">
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

      {/* ── Floating cart button (mobile only, shown on menu view) ── */}
      {posMode !== 'hotel' && mobileView === 'menu' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-20">
          <button onClick={() => setMobileView('cart')}
            className="w-full flex items-center justify-between bg-[#c9a84c] text-black rounded-2xl px-5 py-3.5 shadow-xl font-bold text-sm">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{cart.length === 0 ? 'Cart is empty' : `${cart.reduce((s, i) => s + i.quantity, 0)} item${cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} in cart`}</span>
            </div>
            {cart.length > 0 && <span>₹{total.toFixed(0)} →</span>}
          </button>
        </div>
      )}

      {/* ── Right: Cart ── */}
      <div className={`lg:w-80 flex flex-col border-l border-white/5 bg-black/30 ${posMode === 'hotel' ? 'hidden' : ''} ${mobileView === 'menu' ? 'hidden lg:flex' : 'flex flex-1'}`}>
        {/* Order config */}
        <div className="p-4 border-b border-white/5 space-y-2">
          {/* Mobile back button */}
          <button onClick={() => setMobileView('menu')} className="lg:hidden flex items-center gap-2 text-white/40 hover:text-white text-xs mb-1">
            ← Back to Menu
          </button>
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
              <button onClick={async () => { await placeOrder(); setMobileView('menu') }} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#c9a84c] text-black font-bold text-sm hover:bg-[#d4af5a] transition-colors disabled:opacity-50">
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

// ═══ HOTEL BILL PANEL ══════════════════════════════════════════
interface HotelBillPanelProps {
  config: Record<string, string>
  printHotelBill: (bill: HotelBillData) => void
  syncHotelBill: (order: Record<string, unknown>) => Promise<void>
}
interface HotelBillData {
  guestName: string; roomNo: string; checkIn: string; checkOut: string
  nights: number; roomRate: number
  extras: { desc: string; amt: number }[]
  paymentMode: string; orderNumber: string
}

function HotelBillPanel({ printHotelBill, syncHotelBill }: HotelBillPanelProps) {
  const [guestName, setGuestName] = useState('')
  const [roomNo,    setRoomNo]    = useState('')
  const [checkIn,   setCheckIn]   = useState('')
  const [checkOut,  setCheckOut]  = useState('')
  const [roomRate,  setRoomRate]  = useState('')
  const [extras,    setExtras]    = useState<{ desc: string; amt: string }[]>([])
  const [payment,   setPayment]   = useState('Cash')
  const [lastBill,  setLastBill]  = useState<HotelBillData | null>(null)
  const [saving,    setSaving]    = useState(false)

  const nights = (() => {
    if (!checkIn || !checkOut) return 0
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    return Math.max(0, diff)
  })()

  const roomTotal = nights * Number(roomRate || 0)
  const extrasTotal = extras.reduce((s, e) => s + Number(e.amt || 0), 0)
  const subTotal = roomTotal + extrasTotal
  const cgst = subTotal * 0.06, sgst = cgst
  const grandTotal = subTotal + cgst + sgst

  const addExtra = () => setExtras(prev => [...prev, { desc: '', amt: '' }])
  const updateExtra = (i: number, field: 'desc' | 'amt', val: string) =>
    setExtras(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
  const removeExtra = (i: number) => setExtras(prev => prev.filter((_, idx) => idx !== i))

  const handleGenerate = async () => {
    if (!guestName || !roomNo || !checkIn || !checkOut || !roomRate) return
    setSaving(true)
    const orderNumber = `HT-${Date.now().toString(36).toUpperCase()}`
    const billData: HotelBillData = {
      guestName, roomNo, checkIn, checkOut, nights,
      roomRate: Number(roomRate),
      extras: extras.filter(e => e.desc && e.amt).map(e => ({ desc: e.desc, amt: Number(e.amt) })),
      paymentMode: payment, orderNumber,
    }
    // Save to Supabase / IndexedDB
    const itemsArr = [
      { item_name: `Room ${roomNo} (${nights} night${nights !== 1 ? 's' : ''})`, quantity: nights, price: Number(roomRate), tax_rate: 12, category: 'Hotel' },
      ...billData.extras.map(e => ({ item_name: e.desc, quantity: 1, price: e.amt, tax_rate: 12, category: 'Hotel Extra' })),
    ]
    await syncHotelBill({
      order_number: orderNumber, order_type: 'dine-in',
      table_name: `Room ${roomNo}`, customer_name: guestName,
      items: itemsArr, subtotal: subTotal, cgst, sgst, total: grandTotal,
      payment_mode: payment, status: 'paid', item_count: itemsArr.length,
      item_summary: `Room ${roomNo} — ${guestName}`, created_at: new Date().toISOString(),
    })
    setLastBill(billData)
    setSaving(false)
  }

  const PAYMENT_MODES_HOTEL = ['Cash', 'UPI', 'Card', 'Credit', 'Cheque']

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Hotel className="w-5 h-5 text-[#c9a84c]" />
        <h2 className="text-white font-bold">Hotel Folio / Room Bill</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Guest Name *</label>
          <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="e.g. Rajesh Sharma"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]/40" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Room No *</label>
          <input value={roomNo} onChange={e => setRoomNo(e.target.value)} placeholder="e.g. 201"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]/40" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Check-in *</label>
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]/40" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Check-out *</label>
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]/40" />
        </div>
        <div className="col-span-2">
          <label className="text-white/50 text-xs mb-1 block">Room Rate per Night (₹) *</label>
          <input type="number" value={roomRate} onChange={e => setRoomRate(e.target.value)} placeholder="e.g. 1800"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]/40" />
        </div>
      </div>

      {/* Nights badge */}
      {nights > 0 && (
        <div className="flex items-center gap-2 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl px-3 py-2">
          <span className="text-[#c9a84c] font-bold text-sm">{nights} night{nights !== 1 ? 's' : ''}</span>
          <span className="text-white/40 text-xs">× ₹{roomRate} = ₹{roomTotal.toFixed(0)}</span>
        </div>
      )}

      {/* Extra charges */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/50 text-xs font-medium">Extra Charges (food, laundry, etc.)</label>
          <button onClick={addExtra} className="text-xs text-[#c9a84c]/70 hover:text-[#c9a84c] flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {extras.map((e, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={e.desc} onChange={ev => updateExtra(i, 'desc', ev.target.value)} placeholder="Description"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c9a84c]/40" />
            <input type="number" value={e.amt} onChange={ev => updateExtra(i, 'amt', ev.target.value)} placeholder="₹"
              className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#c9a84c]/40" />
            <button onClick={() => removeExtra(i)} className="p-2 text-red-400/60 hover:text-red-400 rounded-xl bg-red-500/5">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Payment mode */}
      <div>
        <label className="text-white/50 text-xs mb-2 block">Payment Mode</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_MODES_HOTEL.map(m => (
            <button key={m} onClick={() => setPayment(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${payment === m ? 'bg-[#c9a84c] text-black' : 'bg-white/5 text-white/50 hover:text-white'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Bill summary */}
      {nights > 0 && roomRate && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-1 text-sm">
          <div className="flex justify-between text-white/60"><span>Room ({nights} nights)</span><span>₹{roomTotal.toFixed(2)}</span></div>
          {extras.filter(e => e.desc && e.amt).map((e, i) => (
            <div key={i} className="flex justify-between text-white/60"><span>{e.desc}</span><span>₹{Number(e.amt).toFixed(2)}</span></div>
          ))}
          <div className="flex justify-between text-white/40 text-xs border-t border-white/5 pt-1"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-white/40 text-xs"><span>CGST @6%</span><span>₹{cgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-white/40 text-xs"><span>SGST @6%</span><span>₹{sgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-white font-bold text-base border-t border-white/10 pt-2"><span>TOTAL</span><span>₹{grandTotal.toFixed(2)}</span></div>
        </div>
      )}

      <button onClick={handleGenerate} disabled={saving || !guestName || !roomNo || !checkIn || !checkOut || !roomRate || nights <= 0}
        className="w-full py-3 bg-[#c9a84c] text-black rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-[#d4af5a] flex items-center justify-center gap-2">
        {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</> : <><Printer className="w-4 h-4" /> Generate & Print Hotel Bill</>}
      </button>

      {/* Re-print last */}
      {lastBill && (
        <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
          <div>
            <p className="text-green-400 text-xs font-medium">Bill Generated: {lastBill.orderNumber}</p>
            <p className="text-white/40 text-[10px]">{lastBill.guestName} · Room {lastBill.roomNo} · ₹{((lastBill.nights * lastBill.roomRate + lastBill.extras.reduce((s,e)=>s+e.amt,0)) * 1.12).toFixed(0)}</p>
          </div>
          <button onClick={() => printHotelBill(lastBill)} className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}