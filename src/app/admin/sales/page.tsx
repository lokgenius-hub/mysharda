'use client'
import { Fragment, useState, useCallback } from 'react'
import { adminListAll } from '@/lib/supabase-admin-client'
import { useSiteConfig } from '@/lib/use-site-config'
import { posDb } from '@/lib/pos-db'
import {
  BarChart2, Printer, CalendarDays, IndianRupee,
  ShoppingBag, TrendingUp, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────── */
interface OrderItem { item_name: string; price: number; quantity: number; category: string }
interface Order {
  id: string
  order_number: string
  order_type: string
  table_name?: string
  items: OrderItem[]
  subtotal: number
  cgst: number
  sgst: number
  total: number
  payment_mode: string
  status: string
  created_at: string
}

/* ─── Helpers ──────────────────────────────────────────────── */
function fmt(d: Date) { return d.toISOString().slice(0, 10) }
function today() { return fmt(new Date()) }
function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return fmt(d) }
function weekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return fmt(d) }
function monthStart() { const d = new Date(); d.setDate(1); return fmt(d) }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
function fmtCurrency(n: number) { return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const QUICK: { label: string; from: () => string; to: () => string }[] = [
  { label: 'Today',      from: today,       to: today },
  { label: 'Yesterday',  from: yesterday,   to: yesterday },
  { label: 'This Week',  from: weekStart,   to: today },
  { label: 'This Month', from: monthStart,  to: today },
]

const MODE_COLORS: Record<string, string> = {
  Cash: 'bg-green-500/10 text-green-400 border-green-500/20',
  UPI: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Card: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Split: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Credit/Room': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function SalesReportPage() {
  const { config } = useSiteConfig()
  const [fromDate, setFromDate] = useState(today())
  const [toDate, setToDate]     = useState(today())
  const [activeQuick, setActiveQuick] = useState('Today')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  /* ─── Fetch ─── */
  const fetchReport = useCallback(async (from: string, to: string) => {
    setLoading(true); setError(''); setOrders(null); setExpandedOrders(new Set())
    try {
      // 1️⃣ Try Supabase first (has all synced orders)
      const all = await adminListAll('pos_orders', 'created_at') as Order[]
      let filtered = all.filter(o =>
        o.status === 'paid' &&
        o.created_at.slice(0, 10) >= from &&
        o.created_at.slice(0, 10) <= to
      )
      // 2️⃣ Merge local browser orders that haven't synced yet
      try {
        const localAll = await posDb.orders.toArray()
        const localFiltered = localAll.filter(o =>
          o.status === 'paid' &&
          o.created_at.slice(0, 10) >= from &&
          o.created_at.slice(0, 10) <= to
        )
        // Add local orders whose order_number isn't already in Supabase results
        const remoteNums = new Set(filtered.map(o => o.order_number))
        const extra: Order[] = localFiltered
          .filter(lo => !remoteNums.has(lo.order_number))
          .map(lo => ({ ...lo, id: lo.id?.toString() ?? lo.order_number } as Order))
        if (extra.length) filtered = [...filtered, ...extra]
      } catch { /* IndexedDB may not be available in all contexts */ }
      // Sort newest first
      filtered.sort((a, b) => b.created_at.localeCompare(a.created_at))
      setOrders(filtered)
    } catch (e) {
      setError('Could not load data. Make sure you are connected to the internet.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ─── Quick filter ─── */
  function applyQuick(q: typeof QUICK[number]) {
    const f = q.from(), t = q.to()
    setFromDate(f); setToDate(t); setActiveQuick(q.label)
    fetchReport(f, t)
  }

  /* ─── Computed stats ─── */
  const totalRevenue = orders?.reduce((s, o) => s + o.total, 0) ?? 0
  const totalBills   = orders?.length ?? 0
  const totalCgst    = orders?.reduce((s, o) => s + o.cgst, 0) ?? 0
  const totalSgst    = orders?.reduce((s, o) => s + o.sgst, 0) ?? 0
  const avgBill      = totalBills ? totalRevenue / totalBills : 0

  const byMode: Record<string, { count: number; amount: number }> = {}
  orders?.forEach(o => {
    if (!byMode[o.payment_mode]) byMode[o.payment_mode] = { count: 0, amount: 0 }
    byMode[o.payment_mode].count++
    byMode[o.payment_mode].amount += o.total
  })

  const itemMap: Record<string, { qty: number; amount: number; category: string }> = {}
  orders?.forEach(o => o.items?.forEach(i => {
    if (!itemMap[i.item_name]) itemMap[i.item_name] = { qty: 0, amount: 0, category: i.category || '' }
    itemMap[i.item_name].qty += i.quantity
    itemMap[i.item_name].amount += i.price * i.quantity
  }))
  const topItems = Object.entries(itemMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.amount - a.amount)

  /* ─── Toggle order expand ─── */
  function toggleOrder(id: string) {
    setExpandedOrders(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  /* ─── Print ─── */
  function printReport() {
    if (!orders) return
    const hotelName = config.hotel_name || 'SHARDA PALACE'
    const address   = config.address    || 'Bijnor, Uttar Pradesh'
    const phone     = config.phone      || ''
    const gstNo     = config.gst_number || ''
    const rangeLabel = fromDate === toDate ? fmtDate(fromDate + 'T00:00:00') : `${fmtDate(fromDate + 'T00:00:00')} – ${fmtDate(toDate + 'T00:00:00')}`

    const modeRows = Object.entries(byMode)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([m, v]) => `<tr><td>${m}</td><td class="num">${v.count}</td><td class="num">${fmtCurrency(v.amount)}</td></tr>`)
      .join('')

    const itemRows = topItems
      .map((i, idx) => `<tr><td class="num">${idx + 1}</td><td>${i.name}</td><td>${i.category}</td><td class="num">${i.qty}</td><td class="num">${fmtCurrency(i.amount)}</td></tr>`)
      .join('')

    const orderRows = (orders || [])
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(o => `
        <tr>
          <td>${o.order_number}</td>
          <td>${fmtDate(o.created_at)} ${fmtTime(o.created_at)}</td>
          <td>${o.order_type}${o.table_name ? ` / ${o.table_name}` : ''}</td>
          <td>${o.payment_mode}</td>
          <td class="num">${fmtCurrency(o.total)}</td>
        </tr>`)
      .join('')

    const w = window.open('', '_blank', 'width=900,height=800')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Sales Report – ${rangeLabel}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#111; padding:20px 30px; }
  .header { text-align:center; margin-bottom:18px; border-bottom:2px solid #c9a84c; padding-bottom:12px; }
  .hotel-name { font-size:22px; font-weight:bold; letter-spacing:1px; color:#1a1a1a; }
  .hotel-sub  { font-size:11px; color:#555; margin-top:3px; }
  .report-title { font-size:16px; font-weight:bold; margin-top:10px; color:#333; }
  .report-range { font-size:12px; color:#777; margin-top:2px; }
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:16px 0; }
  .stat { border:1px solid #e0e0e0; border-radius:6px; padding:10px 14px; background:#fafafa; }
  .stat-label { font-size:10px; text-transform:uppercase; color:#888; letter-spacing:0.5px; }
  .stat-value { font-size:18px; font-weight:bold; color:#1a1a1a; margin-top:3px; }
  .stat-value.gold { color:#a07830; }
  section { margin:18px 0; }
  h3 { font-size:12px; text-transform:uppercase; letter-spacing:0.5px; color:#888; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:4px; }
  table { width:100%; border-collapse:collapse; margin-top:6px; }
  th { background:#f5f5f5; font-size:10px; text-transform:uppercase; letter-spacing:0.4px; color:#666; padding:6px 8px; text-align:left; }
  td { padding:5px 8px; font-size:11px; border-bottom:1px solid #f0f0f0; }
  tr:last-child td { border-bottom:none; }
  .num { text-align:right; font-variant-numeric: tabular-nums; }
  .total-row td { font-weight:bold; border-top:2px solid #ddd; font-size:12px; background:#fffbf0; }
  .footer { text-align:center; margin-top:24px; font-size:10px; color:#aaa; border-top:1px solid #eee; padding-top:10px; }
  @media print {
    body { padding:10px 15px; }
    @page { margin:8mm; size:A4; }
    .no-print { display:none; }
  }
</style>
</head><body>
<div class="header">
  <div class="hotel-name">${hotelName}</div>
  <div class="hotel-sub">${address}${phone ? ' · ' + phone : ''}${gstNo ? ' · GSTIN: ' + gstNo : ''}</div>
  <div class="report-title">Sales Report</div>
  <div class="report-range">Period: ${rangeLabel}</div>
</div>

<div class="stats-grid">
  <div class="stat"><div class="stat-label">Total Revenue</div><div class="stat-value gold">${fmtCurrency(totalRevenue)}</div></div>
  <div class="stat"><div class="stat-label">Total Bills</div><div class="stat-value">${totalBills}</div></div>
  <div class="stat"><div class="stat-label">Avg Bill Value</div><div class="stat-value">${fmtCurrency(avgBill)}</div></div>
  <div class="stat"><div class="stat-label">Total Tax (GST)</div><div class="stat-value">${fmtCurrency(totalCgst + totalSgst)}</div></div>
</div>

<section>
  <h3>Revenue by Payment Mode</h3>
  <table>
    <thead><tr><th>Payment Mode</th><th class="num">Bills</th><th class="num">Amount</th></tr></thead>
    <tbody>
      ${modeRows}
      <tr class="total-row"><td>Total</td><td class="num">${totalBills}</td><td class="num">${fmtCurrency(totalRevenue)}</td></tr>
    </tbody>
  </table>
</section>

<section>
  <h3>Items Sold (by Revenue)</h3>
  <table>
    <thead><tr><th>#</th><th>Item Name</th><th>Category</th><th class="num">Qty</th><th class="num">Revenue</th></tr></thead>
    <tbody>${itemRows || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:12px">No items</td></tr>'}</tbody>
  </table>
</section>

<section>
  <h3>All Orders (${totalBills})</h3>
  <table>
    <thead><tr><th>Order #</th><th>Date &amp; Time</th><th>Type / Table</th><th>Payment</th><th class="num">Total</th></tr></thead>
    <tbody>${orderRows || '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:12px">No orders</td></tr>'}</tbody>
  </table>
</section>

<div class="footer">Generated on ${new Date().toLocaleString('en-IN')} · ${hotelName} · Management System</div>
</body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 400)
  }

  /* ─── UI ─── */
  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#c9a84c]" /> Sales Report
          </h1>
          <p className="text-white/30 text-sm mt-0.5">Filter by date range and print / save as PDF</p>
        </div>
        {orders !== null && orders.length > 0 && (
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a84c] hover:bg-[#d4b45e] text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#c9a84c]/20"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        )}
      </div>

      {/* Filter card */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 space-y-4">
        {/* Quick buttons */}
        <div>
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Quick Select</p>
          <div className="flex flex-wrap gap-2">
            {QUICK.map(q => (
              <button
                key={q.label}
                onClick={() => applyQuick(q)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  activeQuick === q.label
                    ? 'bg-[#c9a84c] text-black border-transparent font-bold'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range */}
        <div>
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Custom Range</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-white/40 text-xs">From</label>
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={e => { setFromDate(e.target.value); setActiveQuick('') }}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-[#c9a84c]/40 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-white/40 text-xs">To</label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={today()}
                onChange={e => { setToDate(e.target.value); setActiveQuick('') }}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-[#c9a84c]/40 [color-scheme:dark]"
              />
            </div>
            <button
              onClick={() => { setActiveQuick(''); fetchReport(fromDate, toDate) }}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-xl transition-all border border-white/10 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
              {loading ? 'Loading…' : 'Run Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Empty state before first search */}
      {orders === null && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-white/20">
          <BarChart2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-base">Select a date range above and click Run Report</p>
        </div>
      )}

      {/* Results */}
      {orders !== null && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<IndianRupee className="w-4 h-4" />} label="Total Revenue" value={fmtCurrency(totalRevenue)} gold />
            <StatCard icon={<ShoppingBag className="w-4 h-4" />} label="Bills Issued" value={String(totalBills)} />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Avg Bill" value={fmtCurrency(avgBill)} />
            <StatCard icon={<BarChart2 className="w-4 h-4" />} label="Total GST" value={fmtCurrency(totalCgst + totalSgst)} />
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-white/30">No orders found for this period.</div>
          ) : (
            <>
              {/* Two-col: payment mode + top items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Payment breakdown */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">Revenue by Payment Mode</h3>
                  <div className="space-y-3">
                    {Object.entries(byMode)
                      .sort((a, b) => b[1].amount - a[1].amount)
                      .map(([mode, v]) => {
                        const pct = totalRevenue ? (v.amount / totalRevenue) * 100 : 0
                        const cls = MODE_COLORS[mode] || 'bg-white/10 text-white/60 border-white/10'
                        return (
                          <div key={mode}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-md border ${cls}`}>{mode}</span>
                              <span className="text-white text-sm font-semibold">{fmtCurrency(v.amount)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#c9a84c]/60 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-white/30 text-[11px] w-12 text-right">{v.count} bills</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Top items */}
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">Top Items Sold</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {topItems.length === 0 && <p className="text-white/20 text-sm">No items data.</p>}
                    {topItems.map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className="text-white/20 text-xs w-5 text-right shrink-0">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-xs truncate">{item.name}</p>
                          <p className="text-white/30 text-[10px]">{item.category} · qty {item.qty}</p>
                        </div>
                        <span className="text-[#c9a84c] text-xs font-semibold shrink-0">{fmtCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders table */}
              <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-white/50 text-xs uppercase tracking-wider">All Orders ({totalBills})</h3>
                  <span className="text-white/30 text-xs">Click a row to see items</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-[10px] uppercase text-white/30 px-4 py-3">Order #</th>
                        <th className="text-left text-[10px] uppercase text-white/30 px-4 py-3">Date & Time</th>
                        <th className="text-left text-[10px] uppercase text-white/30 px-4 py-3">Type / Table</th>
                        <th className="text-left text-[10px] uppercase text-white/30 px-4 py-3">Payment</th>
                        <th className="text-right text-[10px] uppercase text-white/30 px-4 py-3">Total</th>
                        <th className="px-4 py-3 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .slice()
                        .sort((a, b) => b.created_at.localeCompare(a.created_at))
                        .map(order => {
                          const expanded = expandedOrders.has(order.id)
                          return (
                            <Fragment key={order.id}>
                              <tr
                                onClick={() => toggleOrder(order.id)}
                                className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                              >
                                <td className="px-4 py-3 text-white/70 text-xs font-mono">{order.order_number}</td>
                                <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">
                                  {fmtDate(order.created_at)}<br />
                                  <span className="text-white/30">{fmtTime(order.created_at)}</span>
                                </td>
                                <td className="px-4 py-3 text-white/60 text-xs capitalize">
                                  {order.order_type}{order.table_name ? ` · ${order.table_name}` : ''}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-[11px] px-2 py-0.5 rounded-md border ${MODE_COLORS[order.payment_mode] || 'bg-white/10 text-white/50 border-white/10'}`}>
                                    {order.payment_mode}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-white text-sm font-semibold text-right">{fmtCurrency(order.total)}</td>
                                <td className="px-4 py-3 text-white/30">
                                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </td>
                              </tr>
                              {expanded && (
                                <tr className="bg-black/20 border-b border-white/[0.04]">
                                  <td colSpan={6} className="px-6 py-3">
                                    <div className="space-y-1">
                                      {order.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                          <span className="text-white/50">{item.item_name} <span className="text-white/25">× {item.quantity}</span></span>
                                          <span className="text-white/50">{fmtCurrency(item.price * item.quantity)}</span>
                                        </div>
                                      ))}
                                      <div className="flex justify-between text-[11px] pt-1 border-t border-white/5 mt-1">
                                        <span className="text-white/30">CGST {fmtCurrency(order.cgst)} + SGST {fmtCurrency(order.sgst)}</span>
                                        <span className="text-[#c9a84c] font-semibold">Total {fmtCurrency(order.total)}</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          )
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#c9a84c]/5 border-t border-[#c9a84c]/20">
                        <td colSpan={4} className="px-4 py-3 text-[#c9a84c] text-xs font-bold">TOTAL ({totalBills} orders)</td>
                        <td className="px-4 py-3 text-[#c9a84c] text-base font-black text-right">{fmtCurrency(totalRevenue)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, gold }: { icon: React.ReactNode; label: string; value: string; gold?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${gold ? 'bg-[#c9a84c]/8 border-[#c9a84c]/20' : 'bg-white/[0.02] border-white/8'}`}>
      <div className={`flex items-center gap-1.5 mb-2 ${gold ? 'text-[#c9a84c]/70' : 'text-white/30'}`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-black ${gold ? 'text-[#c9a84c]' : 'text-white'}`}>{value}</p>
    </div>
  )
}
