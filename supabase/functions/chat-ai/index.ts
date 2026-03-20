// Supabase Edge Function: chat-ai
// AI chatbot proxy — keeps GROQ_API_KEY secure on server side.
// Reads hotel info from site_config table per tenant_id — works for multi-tenant.
// Called directly from the browser (ChatBot.tsx) using the public anon key.
// Works on GitHub Pages — no backend/laptop required.
//
// HOW TO DEPLOY:
//   supabase functions deploy chat-ai
//   supabase secrets set GROQ_API_KEY=gsk_YOUR_KEY
//   supabase secrets set GOOGLE_AI_API_KEY=YOUR_KEY   (optional fallback)
//   supabase secrets set OPENROUTER_API_KEY=sk-or-... (optional fallback)
//   supabase secrets set SUPABASE_URL=https://xxx.supabase.co
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Per-tenant config cache (lives for duration of function instance) ─────────
interface HotelConfig {
  site_name: string
  phone: string
  email: string
  address: string
  description: string
  whatsapp_number: string
  groq_api_key: string   // per-tenant; falls back to global GROQ_API_KEY secret if blank
}
const CONFIG_CACHE = new Map<string, { config: HotelConfig; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getHotelConfig(tenantId: string): Promise<HotelConfig> {
  const cached = CONFIG_CACHE.get(tenantId)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.config

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  const fallback: HotelConfig = {
    site_name:       Deno.env.get('DEFAULT_HOTEL_NAME') || 'Our Hotel',
    phone:           Deno.env.get('DEFAULT_PHONE')      || '',
    email:           '',
    address:         '',
    description:     'Hotel, restaurant and banquet hall services.',
    whatsapp_number: Deno.env.get('DEFAULT_WHATSAPP')   || '',
    groq_api_key:    '',
  }

  if (!supabaseUrl || !serviceKey) return fallback

  try {
    // site_config is a key-value table: { config_key, config_value }
    // Filter by tenant_id AND the specific keys we need
    const url = `${supabaseUrl}/rest/v1/site_config?select=config_key,config_value&tenant_id=eq.${encodeURIComponent(tenantId)}&config_key=in.(hotel_name,phone,email,whatsapp,address,description,groq_api_key)`
    const res = await fetch(url, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    })
    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) return fallback

    // Build a plain map from the KV rows
    const kv: Record<string, string> = {}
    for (const row of rows) kv[row.config_key] = row.config_value

    const config: HotelConfig = {
      site_name:       kv['hotel_name']    || fallback.site_name,
      phone:           kv['phone']         || fallback.phone,
      email:           kv['email']         || fallback.email,
      address:         kv['address']       || fallback.address,
      description:     kv['description']   || fallback.description,
      whatsapp_number: kv['whatsapp']      || fallback.whatsapp_number,
      groq_api_key:    kv['groq_api_key']  || '',  // blank = use global secret
    }
    CONFIG_CACHE.set(tenantId, { config, ts: Date.now() })
    return config
  } catch {
    return fallback
  }
}

function buildSystemPrompt(config: HotelConfig, features: string[]): string {
  const hf = {
    hotel:      features.includes('hotel'),
    events:     features.includes('events'),
    restaurant: features.includes('restaurant') || features.includes('menu'),
    travel:     features.includes('travel'),
    coins:      features.includes('coins'),
  }

  const services: string[] = []
  if (hf.restaurant) services.push('multi-cuisine restaurant (North Indian, Mughlai, Chinese, Continental)')
  if (hf.hotel)      services.push('premium hotel rooms (Deluxe, Super Deluxe, Royal Suite)')
  if (hf.events)     services.push('banquet halls and lawn for weddings and events')
  if (hf.travel)     services.push('travel packages (pilgrimage, leisure, group tours)')
  if (hf.coins)      services.push('loyalty coins program (earn per ₹100 spent, redeem for discounts)')

  const servicesList = services.map(s => `- ${s}`).join('\n')

  return `You are the AI concierge for "${config.site_name}".

About ${config.site_name}:
- ${config.description}

Services offered:
${servicesList}
${hf.hotel ? '- Check-in: 12:00 PM | Check-out: 11:00 AM\n' : ''}- Location: ${config.address}
- Phone: +91 ${config.phone}
- Email: ${config.email}

IMPORTANT: Only answer about the services listed above. If the customer asks about a service NOT listed (e.g. rooms if hotel is not offered), politely say you don't offer that service and redirect to what you do offer.

Your personality:
- Warm, helpful — like a concierge
- Use "Namaste" occasionally
- Be concise (2-3 sentences max)
- Suggest calling/Contact page for bookings
- Use emojis sparingly`
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const { messages, tenant_id, features: rawFeatures } = body
    const tenantId = (tenant_id as string) || Deno.env.get('DEFAULT_TENANT_ID') || 'sharda'
    const features: string[] = Array.isArray(rawFeatures) ? rawFeatures : ['hotel','events','restaurant','travel','coins','menu']

    // Load hotel config for this tenant
    const config = await getHotelConfig(tenantId)
    const SYSTEM_PROMPT = buildSystemPrompt(config, features)

    // Try Groq first (fastest free tier)
    // Fallback chain: 1) per-tenant key from DB  2) global secret  3) keyword fallback
    const groqKey = config.groq_api_key || Deno.env.get('GROQ_API_KEY')
    if (groqKey) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-10),
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return new Response(
          JSON.stringify({ message: data.choices[0].message.content }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fallback: Google Gemini
    if (Deno.env.get('GOOGLE_AI_API_KEY')) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${Deno.env.get('GOOGLE_AI_API_KEY')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: messages.slice(-10).map((m: { role: string; content: string }) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        return new Response(
          JSON.stringify({ message: data.candidates[0].content.parts[0].text }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fallback: OpenRouter
    if (Deno.env.get('OPENROUTER_API_KEY')) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-10),
          ],
          max_tokens: 300,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return new Response(
          JSON.stringify({ message: data.choices[0].message.content }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
    }

    // No API key configured — use keyword fallback
    const lastMsg = messages[messages.length - 1]?.content ?? ''
    return new Response(
      JSON.stringify({ message: getFallback(lastMsg, config, features) }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('chat-ai error:', err)
    // Try to get phone from config for a better error message
    const tenantId = 'sharda'
    const cfg = await getHotelConfig(tenantId).catch(() => null)
    const phone = cfg?.phone || '7303584266'
    return new Response(
      JSON.stringify({ message: `Namaste! 🙏 Please call us at +91 ${phone} for immediate assistance.` }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})

function getFallback(query: string, config: HotelConfig, features: string[] = []): string {
  const q = query.toLowerCase()
  const phone = config.phone
  const location = config.address
  const name = config.site_name
  const hf = {
    hotel:      features.includes('hotel'),
    events:     features.includes('events'),
    restaurant: features.includes('restaurant') || features.includes('menu'),
    travel:     features.includes('travel'),
    coins:      features.includes('coins'),
  }
  if (hf.hotel && (q.includes('room') || q.includes('stay') || q.includes('book')))
    return 'We have Deluxe, Super Deluxe, and Royal Suite rooms — all with modern amenities. Call us to book! 📞'
  if (hf.restaurant && (q.includes('menu') || q.includes('food') || q.includes('restaurant')))
    return 'Our restaurant serves North Indian, Mughlai, Chinese, and Continental cuisine. See our Menu page! 🍛'
  if (hf.events && (q.includes('event') || q.includes('wedding') || q.includes('banquet') || q.includes('lawn')))
    return 'Our banquet hall and lawn are perfect for weddings and celebrations. Call us to discuss! 🎉'
  if (hf.coins && (q.includes('coin') || q.includes('loyalty') || q.includes('reward')))
    return 'Earn loyalty coins every time you dine or stay — redeem for discounts on future visits! 🪙'
  if (hf.travel && (q.includes('travel') || q.includes('tour') || q.includes('package')))
    return 'We offer pilgrimage tours, leisure trips, and group packages. Visit our Travel page! ✈️'
  if (q.includes('location') || q.includes('address') || q.includes('where'))
    return `We are located at ${location}. Search "${name}" on Google Maps! 📍`
  return `Namaste! 🙏 For immediate assistance, call us at +91 ${phone} or send a WhatsApp message. We're happy to help!`
}
