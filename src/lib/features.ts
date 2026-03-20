/**
 * Feature flags — controlled via NEXT_PUBLIC_FEATURES env var.
 *
 * Set in .env.local (dev) or GitHub repo Settings → Secrets → Variables (production).
 *
 * Available feature names:
 *   hotel        — Hotel rooms page & admin rooms management
 *   events       — Events/banquet page
 *   travel       — Travel packages page & admin
 *   restaurant   — Restaurant & menu pages (always on by default)
 *   blog         — Blog page & admin
 *   pos          — POS terminal in admin
 *   coins        — Loyalty coins system
 *   gallery      — Gallery page
 *
 * Examples:
 *   All features (Sharda Palace — full hotel):
 *     NEXT_PUBLIC_FEATURES=hotel,events,travel,restaurant,blog,pos,coins,gallery
 *
 *   Restaurant-only (Raj Darbar):
 *     NEXT_PUBLIC_FEATURES=restaurant,blog,pos,coins
 *
 * Default (env var not set): ALL features enabled (backward compatible).
 */

const raw = process.env.NEXT_PUBLIC_FEATURES ?? ''

// If env var is empty/missing → all features on (backward compatible)
const ALL_FEATURES = new Set([
  'hotel', 'events', 'travel', 'restaurant', 'blog', 'pos', 'coins', 'gallery',
])

const enabled: Set<string> = raw.trim()
  ? new Set(raw.split(',').map(f => f.trim().toLowerCase()))
  : new Set(ALL_FEATURES)

/**
 * Check if a feature is enabled.
 * @example  if (hasFeature('hotel')) { ... }
 */
export function hasFeature(feature: string): boolean {
  return enabled.has(feature.toLowerCase())
}

/**
 * React-friendly object — use where you need multiple flags at once.
 * @example  const f = getFeatures(); if (f.hotel) { ... }
 */
export function getFeatures() {
  return {
    hotel:      hasFeature('hotel'),
    events:     hasFeature('events'),
    travel:     hasFeature('travel'),
    restaurant: hasFeature('restaurant'),
    blog:       hasFeature('blog'),
    pos:        hasFeature('pos'),
    coins:      hasFeature('coins'),
    gallery:    hasFeature('gallery'),
  }
}
