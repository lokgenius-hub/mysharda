// Supabase Edge Function: chat-ai
// AI chatbot proxy — keeps GROQ_API_KEY secure on server side.
// Called directly from the browser (ChatBot.tsx) using the public anon key.
// Works on GitHub Pages — no backend/laptop required.
//
// HOW TO DEPLOY:
//   supabase functions deploy chat-ai
//   supabase secrets set GROQ_API_KEY=gsk_YOUR_KEY
//   supabase secrets set GOOGLE_AI_API_KEY=YOUR_KEY   (optional fallback)
//   supabase secrets set OPENROUTER_API_KEY=sk-or-... (optional fallback)
//
// The function URL will be:
//   https://YOUR_PROJECT_ID.supabase.co/functions/v1/chat-ai

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `You are the Royal Concierge AI assistant for "Sharda Palace Hotel & Banquet" in Bijnor, Uttar Pradesh, India.

About Sharda Palace:
- Premium hotel with Deluxe, Super Deluxe, and Royal Suite rooms
- Beautiful Marriage Lawn (open-air, large capacity for weddings)
- Grand AC Banquet Hall (perfect for receptions, corporate events)
- Multi-cuisine restaurant: North Indian, Mughlai, Chinese, Continental
- Sharda Coins loyalty program: earn coins per ₹100 spent, redeem for discounts
- Travel packages: pilgrimage tours, leisure trips, group tours
- Check-in: 12:00 PM | Check-out: 11:00 AM
- Location: Bijnor, Uttar Pradesh, India
- Phone: +91 7303584266
- Email: info@shardapalace.in

Your personality:
- Warm, elegant, helpful — like a palace concierge
- Use "Namaste" occasionally
- Be concise (2-3 sentences max)
- Suggest calling for bookings
- Use emojis sparingly`

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const { messages } = await req.json()

    // Try Groq first (fastest free tier)
    if (Deno.env.get('GROQ_API_KEY')) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
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
      JSON.stringify({ message: getFallback(lastMsg) }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('chat-ai error:', err)
    return new Response(
      JSON.stringify({ message: 'Namaste! 🙏 Please call us at +91 7303584266 for immediate assistance.' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})

function getFallback(query: string): string {
  const q = query.toLowerCase()
  if (q.includes('room') || q.includes('stay') || q.includes('book'))
    return 'We have Deluxe, Super Deluxe, and Royal Suite rooms — all with modern amenities. Call us to book! 📞'
  if (q.includes('menu') || q.includes('food') || q.includes('restaurant'))
    return 'Our restaurant serves North Indian, Mughlai, Chinese, and Continental cuisine. See our Menu page! 🍛'
  if (q.includes('event') || q.includes('wedding') || q.includes('banquet') || q.includes('lawn'))
    return 'Our Marriage Lawn and AC Banquet Hall are perfect for weddings and celebrations. Call us to discuss! 🎉'
  if (q.includes('coin') || q.includes('loyalty') || q.includes('reward'))
    return 'Earn Sharda Coins every time you dine or stay — redeem for discounts on future visits! 🪙'
  if (q.includes('travel') || q.includes('tour') || q.includes('package'))
    return 'We offer pilgrimage tours, leisure trips, and group packages. Visit our Travel page! ✈️'
  if (q.includes('location') || q.includes('address') || q.includes('where'))
    return 'We are located in Bijnor, Uttar Pradesh. Search "Sharda Palace Bijnor" on Google Maps! 📍'
  return 'Namaste! 🙏 For immediate assistance, call us at +91 7303584266 or send a WhatsApp message. We\'re happy to help!'
}
