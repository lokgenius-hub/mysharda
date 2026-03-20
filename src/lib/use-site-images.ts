/**
 * useSiteImages — Client-side hook to fetch named image slots from Supabase.
 *
 * Pattern (from Vercel project):
 *   1. DEFAULT_IMAGES map has fallback Unsplash URLs for every image key
 *   2. site_images table in Supabase has (image_key, url) pairs
 *   3. Hook merges: DB URLs override defaults
 *   4. Components use: images.heroHome, images.roomDeluxe, etc.
 *
 * Admin can replace any image from the admin Images page.
 */
'use client'
import { useState, useEffect } from 'react'
import { supabasePublic } from './supabase-public'

// ─── Default images (fallbacks when DB has no override) ─────
export const DEFAULT_IMAGES: Record<string, string> = {
  // Page Heroes
  heroHome:          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=80',
  heroHotel:         'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80',
  heroRestaurant:    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
  heroEvents:        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80',
  heroTravel:        'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=1920&q=80',
  heroGallery:       'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80',
  heroMenu:          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
  heroBlog:          'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80',

  // Room Types
  roomStandard:      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  roomDeluxe:        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  roomSuite:         'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',

  // Homepage services
  serviceHotel:      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  serviceRestaurant: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  serviceEvents:     'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',

  // About & CTA
  aboutImage:        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',
  ctaBanner:         'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=70',

  // Restaurant
  cuisineNorthIndian:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  cuisineVeg:        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  cuisineSweets:     'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
  restaurantInterior:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',

  // Events
  eventWedding:      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
  eventBirthday:     'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80',
  eventCorporate:    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
  eventSeminar:      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80',
  eventReligious:    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
  eventFamily:       'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80',

  // Travel
  travelVrindavan:   'https://images.unsplash.com/photo-1581367736476-f4c4e6d6e4ea?w=600&q=80',
  travelMathura:     'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
  travelAgra:        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80',

  // Gallery
  gallery1:          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
  gallery2:          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  gallery3:          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  gallery4:          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  gallery5:          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
  gallery6:          'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
  gallery7:          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  gallery8:          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  gallery9:          'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  gallery10:         'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
  gallery11:         'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  gallery12:         'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
}

// Image key labels for admin UI
export const IMAGE_KEY_LABELS: Record<string, string> = {
  heroHome:           'Homepage Hero',
  heroHotel:          'Hotel Page Hero',
  heroRestaurant:     'Restaurant Page Hero',
  heroEvents:         'Events Page Hero',
  heroTravel:         'Travel Page Hero',
  heroGallery:        'Gallery Page Hero',
  heroMenu:           'Menu Page Hero',
  heroBlog:           'Blog Page Hero',
  roomStandard:       'Standard Room Photo',
  roomDeluxe:         'Deluxe Room Photo',
  roomSuite:          'Suite Room Photo',
  serviceHotel:       'Homepage – Hotel Card',
  serviceRestaurant:  'Homepage – Restaurant Card',
  serviceEvents:      'Homepage – Events Card',
  aboutImage:         'Homepage – About Section',
  ctaBanner:          'Homepage – CTA Banner',
  cuisineNorthIndian: 'Restaurant – North Indian',
  cuisineVeg:         'Restaurant – Vegetarian',
  cuisineSweets:      'Restaurant – Sweets',
  restaurantInterior: 'Restaurant – Interior',
  eventWedding:       'Events – Wedding',
  eventBirthday:      'Events – Birthday',
  eventCorporate:     'Events – Corporate',
  eventSeminar:       'Events – Seminar',
  eventReligious:     'Events – Religious',
  eventFamily:        'Events – Family Function',
  travelVrindavan:    'Travel – Vrindavan',
  travelMathura:      'Travel – Mathura',
  travelAgra:         'Travel – Agra / Taj Mahal',
  gallery1:           'Gallery Photo 1',
  gallery2:           'Gallery Photo 2',
  gallery3:           'Gallery Photo 3',
  gallery4:           'Gallery Photo 4',
  gallery5:           'Gallery Photo 5',
  gallery6:           'Gallery Photo 6',
  gallery7:           'Gallery Photo 7',
  gallery8:           'Gallery Photo 8',
  gallery9:           'Gallery Photo 9',
  gallery10:          'Gallery Photo 10',
  gallery11:          'Gallery Photo 11',
  gallery12:          'Gallery Photo 12',
}

export type SiteImages = Record<string, string>

const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || 'sharda'
const LS_KEY = `${TENANT}_site_images_v1`

// Try to read from localStorage synchronously (available before fetch)
function readLocalCache(): SiteImages | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SiteImages
  } catch { return null }
}

function writeLocalCache(imgs: SiteImages) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(imgs)) } catch { /* quota */ }
}

// Simple in-memory cache
let _cache: SiteImages | null = null
let _cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

/** Call this after any admin change to force the next fetch to bypass the cache. */
export function clearSiteImagesCache() {
  _cache = null
  _cacheTime = 0
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(LS_KEY) } catch { /* empty */ }
  }
}

async function fetchSiteImages(): Promise<SiteImages> {
  const now = Date.now()
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache

  try {
    const { data } = await supabasePublic
      .from('site_images')
      .select('image_key, url')
      .eq('tenant_id', TENANT)
      .eq('is_active', true)
      .not('image_key', 'is', null)
      .order('created_at', { ascending: true })

    const merged = { ...DEFAULT_IMAGES }
    if (data) {
      for (const row of data) {
        if (row.image_key && row.url) {
          merged[row.image_key] = row.url
        }
      }
    }
    _cache = merged
    _cacheTime = now
    writeLocalCache(merged)
    return merged
  } catch {
    return { ...DEFAULT_IMAGES }
  }
}

/**
 * React hook: returns merged image map (DB overrides defaults).
 * Usage: const { images, loading } = useSiteImages()
 *        <img src={images.heroHome} />
 */
export function useSiteImages() {
  // Always start with DEFAULT_IMAGES so server and client render the same HTML (no hydration mismatch).
  // After mount we immediately apply the localStorage cache (fast, no network) then fetch fresh from DB.
  const [images, setImages] = useState<SiteImages>(DEFAULT_IMAGES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Apply localStorage cache first for near-instant paint (no flash)
    const cached = readLocalCache()
    if (cached) setImages(cached)
    // Then fetch fresh from DB
    fetchSiteImages()
      .then(setImages)
      .finally(() => setLoading(false))
  }, [])

  // Listen for admin updates and refresh the image map immediately
  useEffect(() => {
    function onUpdated() {
      fetchSiteImages().then(setImages).catch(() => {})
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('site-images-updated', onUpdated)
      return () => window.removeEventListener('site-images-updated', onUpdated)
    }
    return
  }, [])

  return { images, loading }
}

/**
 * Non-hook version for use outside React components.
 */
export { fetchSiteImages }
