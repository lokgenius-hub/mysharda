'use client'
import { useEffect, useState, useCallback } from 'react'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { adminListAll, adminUpdate, adminInsert } from '@/lib/supabase-admin-client'
import { DEFAULT_CONFIG } from '@/lib/use-site-config'

interface ConfigRow { id: string; config_key: string; config_value: string; label?: string; category?: string }

const CATEGORY_ORDER = ['general', 'contact', 'social', 'maps', 'timings']
const CATEGORY_LABELS: Record<string, string> = {
  general: '🏨 General',
  contact: '📞 Contact Information',
  social: '🌐 Social Media',
  maps: '📍 Location & Maps',
  timings: '🕐 Timings',
}

export default function ConfigPage() {
  const [rows, setRows] = useState<ConfigRow[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, string>>({}) // config_key → new value
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('site_config', 'category')
      setRows(data as ConfigRow[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Build key→row map
  const keyToRow = new Map(rows.map(r => [r.config_key, r]))

  // Build grouped list — include all DEFAULT_CONFIG keys, merged with DB
  const grouped: Record<string, { key: string; label: string; value: string; hasRow: boolean; rowId?: string }[]> = {}

  // From DB rows first
  for (const row of rows) {
    const cat = row.category || 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push({
      key: row.config_key,
      label: row.label ?? row.config_key,
      value: edits[row.config_key] ?? row.config_value,
      hasRow: true,
      rowId: row.id,
    })
  }

  // Fill in any DEFAULT_CONFIG keys not in DB
  for (const [key, defaultVal] of Object.entries(DEFAULT_CONFIG)) {
    if (!keyToRow.has(key)) {
      const cat = key.includes('facebook') || key.includes('instagram') || key.includes('youtube') ? 'social'
        : key.includes('map') ? 'maps'
        : key.includes('phone') || key.includes('email') || key.includes('address') || key.includes('whatsapp') ? 'contact'
        : key.includes('hour') || key.includes('check') ? 'timings'
        : 'general'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: edits[key] ?? defaultVal,
        hasRow: false,
      })
    }
  }

  const saveOne = async (key: string) => {
    const newValue = edits[key]
    if (newValue === undefined) return
    setSaving(key)
    try {
      const existing = keyToRow.get(key)
      if (existing) {
        await adminUpdate('site_config', existing.id, { config_value: newValue })
      } else {
        // Insert new row
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        const cat = key.includes('facebook') || key.includes('instagram') || key.includes('youtube') ? 'social'
          : key.includes('map') ? 'maps'
          : key.includes('phone') || key.includes('email') || key.includes('address') || key.includes('whatsapp') ? 'contact'
          : key.includes('hour') || key.includes('check') ? 'timings' : 'general'
        await adminInsert('site_config', { config_key: key, config_value: newValue, label, category: cat })
      }
      setEdits(prev => { const n = { ...prev }; delete n[key]; return n })
      await load()
    } catch (e) {
      alert('Save failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
    setSaving(null)
  }

  const isLongField = (key: string) =>
    key.includes('description') || key.includes('tagline') || key.includes('maps_embed') || key.includes('address')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#c9a84c]" /> Site Configuration
        </h1>
        <button onClick={load} className="p-2 bg-white/5 text-white/40 hover:text-white rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-white/40 text-sm">
        Manage your hotel website settings: contact info, social links, Google Maps, timings, and more.
        Changes appear on the public website instantly.
      </p>

      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="space-y-8">
          {CATEGORY_ORDER.map(cat => {
            const items = grouped[cat]
            if (!items?.length) return null
            return (
              <div key={cat}>
                <h2 className="text-white/80 font-bold text-sm mb-4 border-b border-white/10 pb-2">
                  {CATEGORY_LABELS[cat] ?? cat}
                </h2>
                <div className="space-y-3">
                  {items.map(item => {
                    const hasEdit = item.key in edits
                    return (
                      <div key={item.key} className={`rounded-xl border p-4 ${hasEdit ? 'border-[#c9a84c]/40 bg-[#c9a84c]/5' : 'border-white/5 bg-white/[0.02]'}`}>
                        <label className="text-white/50 text-xs font-medium block mb-1.5">{item.label}</label>
                        {isLongField(item.key) ? (
                          <textarea
                            value={edits[item.key] ?? (item.hasRow ? (keyToRow.get(item.key)?.config_value ?? '') : (DEFAULT_CONFIG[item.key] ?? ''))}
                            onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20 resize-none"
                          />
                        ) : (
                          <input
                            value={edits[item.key] ?? (item.hasRow ? (keyToRow.get(item.key)?.config_value ?? '') : (DEFAULT_CONFIG[item.key] ?? ''))}
                            onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#c9a84c]/40 placeholder-white/20"
                          />
                        )}
                        {hasEdit && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setEdits(prev => { const n = { ...prev }; delete n[item.key]; return n })}
                              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs"
                            >Cancel</button>
                            <button
                              onClick={() => saveOne(item.key)}
                              disabled={saving === item.key}
                              className="px-4 py-1.5 rounded-lg bg-[#c9a84c] text-black font-semibold text-xs disabled:opacity-50 flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" /> {saving === item.key ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
