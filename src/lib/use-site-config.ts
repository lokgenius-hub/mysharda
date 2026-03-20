/**
 * useSiteConfig — Client-side hook to fetch site config from Supabase.
 *
 * Returns a key-value map of all config: Google Maps, phone, email, address, etc.
 * Admin updates these from the Site Config admin page.
 */
'use client'
import { useState, useEffect } from 'react'
import { supabasePublic } from './supabase-public'

// Import for use within this file, and re-export so callers only need one import
import { DEFAULT_CONFIG, safeUrl } from './site-config-defaults'
export { DEFAULT_CONFIG, safeUrl }

export type SiteConfig = Record<string, string>

// Tenant ID for this deployment
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || 'sharda'

// Simple in-memory cache
let _cache: SiteConfig | null = null
let _cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

/** Bust cache so hooks refetch on next render (called by EditableText after save) */
export function clearSiteConfigCache() {
  _cache = null
  _cacheTime = 0
}

async function fetchSiteConfig(): Promise<SiteConfig> {
  const now = Date.now()
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache

  try {
    const { data } = await supabasePublic
      .from('site_config')
      .select('config_key, config_value')
      .eq('tenant_id', TENANT)

    const merged = { ...DEFAULT_CONFIG }
    if (data) {
      for (const row of data) {
        if (row.config_key && row.config_value) {
          merged[row.config_key] = row.config_value
        }
      }
    }
    _cache = merged
    _cacheTime = now
    return merged
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * React hook: returns merged config map (DB overrides defaults).
 * Usage: const { config, loading } = useSiteConfig()
 *        <a href={`tel:${config.phone}`}>Call</a>
 */
export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSiteConfig()
      .then(setConfig)
      .finally(() => setLoading(false))
  }, [])

  // Refetch immediately when EditableText saves a value
  useEffect(() => {
    function onUpdated() {
      clearSiteConfigCache()
      fetchSiteConfig().then(setConfig).catch(() => {})
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('site-config-updated', onUpdated)
      return () => window.removeEventListener('site-config-updated', onUpdated)
    }
    return
  }, [])

  return { config, loading }
}

export { fetchSiteConfig }
