'use client'
/**
 * EditableText — drop-in wrapper around any text that lets admins
 * click a pencil icon and edit it in-place, syncing to site_config.
 *
 * Usage:
 *   <EditableText configKey="address" value={config.address}>
 *     <span>{config.address}</span>
 *   </EditableText>
 *
 * Only the pencil icon is shown to logged-in Supabase admin users.
 * On static / public view the children render normally — no overhead.
 */
import { useState, useEffect, useRef } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { getAdminSession, getSupabaseAdmin, getActiveTenant } from '@/lib/supabase-admin-client'

interface Props {
  configKey: string          // the site_config.config_key to update
  value: string              // current value (controlled)
  multiline?: boolean        // use textarea instead of input
  className?: string         // wrapper div class
  children: React.ReactNode  // the element to render / make editable
}

export default function EditableText({
  configKey, value, multiline = false, className = '', children,
}: Props) {
  const [isAdmin, setIsAdmin]   = useState(false)
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState(value)
  const [saving, setSaving]     = useState(false)
  const [hover, setHover]       = useState(false)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  // Check Supabase Auth session once on mount
  useEffect(() => {
    getAdminSession().then(s => setIsAdmin(!!s)).catch(() => {})
  }, [])

  // Sync draft when value prop changes (e.g. after external save)
  useEffect(() => { setDraft(value) }, [value])

  // Focus input when editing starts
  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEdit = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDraft(value)
    setEditing(true)
  }

  const cancel = () => { setEditing(false); setDraft(value) }

  const save = async () => {
    if (draft === value) { setEditing(false); return }
    setSaving(true)
    try {
      const sb = getSupabaseAdmin()
      const { error } = await sb
        .from('site_config')
        .upsert(
          { tenant_id: getActiveTenant(), config_key: configKey, config_value: draft },
          { onConflict: 'tenant_id,config_key' }
        )
      if (error) throw error
      window.dispatchEvent(new Event('site-config-updated'))
      setEditing(false)
    } catch (err) {
      alert('Save failed: ' + (err instanceof Error ? err.message : String(err)))
    }
    setSaving(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') cancel()
    if (e.key === 'Enter' && !multiline) save()
  }

  // Non-admin: render children as-is
  if (!isAdmin) return <>{children}</>

  if (editing) {
    return (
      <span className={`inline-flex flex-col gap-1.5 w-full ${className}`}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={3}
            className="w-full bg-[var(--bg-card)] border border-[var(--primary)]/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKey}
            className="w-full bg-[var(--bg-card)] border border-[var(--primary)]/50 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        )}
        <span className="flex gap-1">
          <button
            onClick={save}
            disabled={saving}
            title="Save"
            className="flex items-center gap-1 px-3 py-1 bg-[var(--primary)] text-[var(--bg-deep)] text-xs font-semibold rounded-md disabled:opacity-50"
          >
            <Check className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={cancel}
            title="Cancel"
            className="flex items-center gap-1 px-2 py-1 bg-white/10 text-white/60 text-xs rounded-md hover:bg-white/20"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      </span>
    )
  }

  return (
    <span
      className={`relative group inline-block ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      {hover && (
        <button
          onClick={startEdit}
          title={`Edit "${configKey}"`}
          className="inline-flex items-center gap-1 ml-1.5 px-1.5 py-0.5 bg-[var(--primary)]/20 border border-[var(--primary)]/40 text-[var(--primary)] rounded text-[10px] align-middle hover:bg-[var(--primary)]/30 transition-colors"
        >
          <Pencil className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  )
}
