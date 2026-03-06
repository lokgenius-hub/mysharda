/**
 * useSiteConfig — Client-side hook to fetch site config from Supabase.
 *
 * Returns a key-value map of all config: Google Maps, phone, email, address, etc.
 * Admin updates these from the Site Config admin page.
 */
'use client'
import { useState, useEffect } from 'react'
import { supabasePublic } from './supabase-public'

export const DEFAULT_CONFIG: Record<string, string> = {
  hotel_name:         'Sharda Palace',
  tagline:            'Where Tradition Meets Luxury',
  description:        'Luxury hotel, restaurant and banquet hall in the heart of Bijnor, Uttar Pradesh.',
  phone:              '+91 73035 84266',
  email:              'info@shardapalace.in',
  whatsapp:           '917303584266',
  address:            'Behind Patnwar Petrol Pump, Bhabua Road, Bijnor, Uttar Pradesh 246701',
  facebook_url:       'https://facebook.com',
  instagram_url:      'https://instagram.com',
  youtube_url:        'https://youtube.com',
  google_maps_embed:  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55903.63498498846!2d78.09775995!3d29.37220735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390b90495be88267%3A0xdf467da08c1578eb!2sBijnor%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1703500000000!5m2!1sen!2sin',
  google_maps_link:   'https://maps.google.com/?q=Sharda+Palace+Bijnor',
  restaurant_hours:   '7:00 AM – 11:00 PM',
  reception_hours:    '24 × 7',
  checkin_time:       '12:00 Noon',
  checkout_time:      '11:00 AM',
}

export type SiteConfig = Record<string, string>

// Simple in-memory cache
let _cache: SiteConfig | null = null
let _cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

async function fetchSiteConfig(): Promise<SiteConfig> {
  const now = Date.now()
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache

  try {
    const { data } = await supabasePublic
      .from('site_config')
      .select('config_key, config_value')

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

  return { config, loading }
}

export { fetchSiteConfig }
