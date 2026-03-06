'use client'
import { useEffect, useState, useCallback } from 'react'
import { Image as ImageIcon, RefreshCw, Save, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { adminListAll, adminUpdate, adminInsert } from '@/lib/supabase-admin-client'
import { DEFAULT_IMAGES, IMAGE_KEY_LABELS } from '@/lib/use-site-images'

interface SiteImage { id: string; url: string; alt?: string; category?: string; image_key?: string; is_active: boolean }

// Group image keys by section for better UI
const KEY_GROUPS: { title: string; keys: string[] }[] = [
  { title: '🏛️ Page Heroes', keys: ['heroHome','heroHotel','heroRestaurant','heroEvents','heroTravel','heroGallery','heroMenu','heroBlog'] },
  { title: '🛏️ Room Types', keys: ['roomStandard','roomDeluxe','roomSuite'] },
  { title: '🏠 Homepage Sections', keys: ['serviceHotel','serviceRestaurant','serviceEvents','aboutImage','ctaBanner'] },
  { title: '🍛 Restaurant & Food', keys: ['cuisineNorthIndian','cuisineVeg','cuisineSweets','restaurantInterior'] },
  { title: '🎉 Events', keys: ['eventWedding','eventBirthday','eventCorporate','eventSeminar','eventReligious','eventFamily'] },
  { title: '✈️ Travel', keys: ['travelVrindavan','travelMathura','travelAgra'] },
  { title: '🖼️ Gallery Photos', keys: ['gallery1','gallery2','gallery3','gallery4','gallery5','gallery6','gallery7','gallery8','gallery9','gallery10','gallery11','gallery12'] },
]

export default function ImagesPage() {
  const [dbImages, setDbImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, string>>({}) // key → new URL
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('site_images', 'sort_order')
      setDbImages(data as SiteImage[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Map: image_key → SiteImage row
  const keyToImage = new Map(dbImages.filter(i => i.image_key).map(i => [i.image_key!, i]))

  const getUrl = (key: string) => edits[key] ?? keyToImage.get(key)?.url ?? DEFAULT_IMAGES[key] ?? ''

  const saveOne = async (key: string) => {
    const newUrl = edits[key]
    if (!newUrl) return
    setSaving(key)
    try {
      const existing = keyToImage.get(key)
      if (existing) {
        await adminUpdate('site_images', existing.id, { url: newUrl })
      } else {
        // Create new row with this image_key
        const label = IMAGE_KEY_LABELS[key] ?? key
        const category = key.startsWith('hero') ? 'hero' : key.startsWith('room') ? 'rooms' : key.startsWith('service') ? 'services' :
          key.startsWith('cuisine') || key.startsWith('restaurant') ? 'food' : key.startsWith('event') ? 'events' :
          key.startsWith('travel') ? 'travel' : key.startsWith('gallery') ? 'gallery' : 'general'
        await adminInsert('site_images', { image_key: key, url: newUrl, alt: label, category, sort_order: 0, is_active: true })
      }
      setEdits(prev => { const n = { ...prev }; delete n[key]; return n })
      await load()
    } catch (e) {
      alert('Save failed: ' + (e instanceof Error ? e.message : 'Unknown error'))
    }
    setSaving(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#c9a84c]" /> Site Images</h1>
        <button onClick={load} className="p-2 bg-white/5 text-white/40 hover:text-white rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <p className="text-white/40 text-sm">
        Replace any image URL below. Each slot corresponds to a specific location on the website.
        Paste a new image URL and click Save to update.
      </p>

      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="space-y-8">
          {KEY_GROUPS.map(group => (
            <div key={group.title}>
              <h2 className="text-white/80 font-bold text-sm mb-4 border-b border-white/10 pb-2">{group.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.keys.map(key => {
                  const currentUrl = getUrl(key)
                  const hasEdit = key in edits
                  const label = IMAGE_KEY_LABELS[key] ?? key
                  return (
                    <div key={key} className={`rounded-xl border ${hasEdit ? 'border-[#c9a84c]/40 bg-[#c9a84c]/5' : 'border-white/5 bg-white/[0.02]'} overflow-hidden`}>
                      {/* Preview */}
                      <div className="aspect-video bg-white/5 relative">
                        {currentUrl && (
                          <Image src={currentUrl} alt={label} fill className="object-cover" />
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur text-white/70 text-[10px] rounded-full">{label}</span>
                        </div>
                        {currentUrl && (
                          <a href={currentUrl} target="_blank" rel="noopener noreferrer"
                            className="absolute top-2 right-2 p-1 bg-black/60 text-white/50 hover:text-white rounded-lg">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {/* URL input */}
                      <div className="p-3 space-y-2">
                        <input
                          value={edits[key] ?? ''}
                          onChange={e => setEdits(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder="Paste new image URL..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#c9a84c]/40 placeholder-white/20"
                        />
                        {hasEdit && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEdits(prev => { const n = { ...prev }; delete n[key]; return n })}
                              className="flex-1 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs"
                            >Cancel</button>
                            <button
                              onClick={() => saveOne(key)}
                              disabled={saving === key}
                              className="flex-1 py-1.5 rounded-lg bg-[#c9a84c] text-black font-semibold text-xs disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <Save className="w-3 h-3" /> {saving === key ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
