'use client'
import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Filter, RefreshCw, Phone, Mail, Calendar, Check, X } from 'lucide-react'
import { adminListAll, adminUpdate } from '@/lib/supabase-admin-client'

// WhatsApp SVG icon (green, inline)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

interface Enquiry {
  id: string; name: string; phone: string; email?: string
  enquiry_type: string; message?: string; preferred_date?: string
  guests?: number; status: string; is_read: boolean; created_at: string
}

const types = ['', 'hotel', 'event', 'restaurant', 'travel', 'general']
const statuses = ['', 'pending', 'contacted', 'confirmed', 'cancelled']

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selected, setSelected] = useState<Enquiry | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let data = await adminListAll('enquiries', 'created_at') as Enquiry[]
      if (statusFilter) data = data.filter(e => e.status === statusFilter)
      if (typeFilter) data = data.filter(e => e.enquiry_type === typeFilter)
      setEnquiries(data)
    } catch { /* empty */ }
    setLoading(false)
  }, [statusFilter, typeFilter])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    try { await adminUpdate('enquiries', id, { status, is_read: true }) } catch { /* empty */ }
    load()
    if (selected?.id === id) setSelected(p => p ? { ...p, status } : null)
  }

  const typeColor: Record<string, string> = {
    hotel: 'bg-blue-500/15 text-blue-400', event: 'bg-pink-500/15 text-pink-400',
    restaurant: 'bg-orange-500/15 text-orange-400', travel: 'bg-teal-500/15 text-teal-400',
    general: 'bg-white/10 text-white/50',
  }
  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400', contacted: 'bg-blue-500/15 text-blue-400',
    confirmed: 'bg-green-500/15 text-green-400', cancelled: 'bg-red-500/15 text-red-400',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--primary)]" /> Enquiries
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
            {types.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
            {statuses.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <button onClick={load} className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-white/30">Loading...</div>
      ) : enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-white/30">
          <Filter className="w-8 h-8 mb-2 opacity-30" />
          No enquiries found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {enquiries.map(e => (
            <div key={e.id}
              onClick={() => setSelected(e)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-[var(--primary)]/20 ${selected?.id === e.id ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white/90 font-medium text-sm">{e.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${typeColor[e.enquiry_type] ?? 'bg-white/10 text-white/40'}`}>
                      {e.enquiry_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusColor[e.status] ?? 'bg-white/10 text-white/40'}`}>
                      {e.status}
                    </span>
                    {!e.is_read && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{e.phone}</span>
                    {e.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{e.email}</span>}
                    {e.preferred_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{e.preferred_date}</span>}
                  </div>
                  {e.message && <p className="text-white/40 text-xs mt-1 truncate">{e.message}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {/* WhatsApp one-click — always visible */}
                  <a
                    href={`https://wa.me/91${e.phone}?text=${encodeURIComponent(`Hi ${e.name}, thank you for contacting Sharda Palace! We received your ${e.enquiry_type} enquiry${e.preferred_date ? ' for ' + e.preferred_date : ''}. Our team will assist you shortly. 🙏`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={ev => ev.stopPropagation()}
                    className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                    title="Send WhatsApp Message"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </a>
                  {e.status === 'pending' && (
                    <>
                      <button onClick={ev => { ev.stopPropagation(); updateStatus(e.id, 'contacted') }}
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Mark Contacted">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={ev => { ev.stopPropagation(); updateStatus(e.id, 'confirmed') }}
                        className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors" title="Confirm">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={ev => { ev.stopPropagation(); updateStatus(e.id, 'cancelled') }}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Cancel">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
