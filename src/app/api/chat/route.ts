import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are the Royal Concierge AI assistant for "Sharda Palace Hotel & Banquet" in Bijnor, Uttar Pradesh, India.

About Sharda Palace:
- Premium hotel with Deluxe, Super Deluxe, and Royal Suite rooms
- Beautiful Marriage Lawn (large capacity, open-air)
- Grand Banquet Hall (fully AC, perfect for celebrations)
- Multi-cuisine restaurant with North Indian, Mughlai, Chinese, and Continental cuisines
- Sharda Coins loyalty program: Earn coins per ₹100 spent, redeem for discounts
- Full travel package services for pilgrimages and leisure tours
- Check-in: 12:00 PM, Check-out: 11:00 AM
- Address: Bijnor, Uttar Pradesh
- Contact: +91 ${process.env.NEXT_PUBLIC_HOTEL_PHONE || '7303584266'}
- WhatsApp: +91 ${process.env.NEXT_PUBLIC_HOTEL_WHATSAPP || '917303584266'}

Services:
- Hotel rooms (AC, WiFi, TV, room service)
- Restaurant & takeaway
- Event hosting (weddings, receptions, corporate events, birthday parties)
- Travel packages (pilgrimage, leisure, group tours)
- Sharda Coins loyalty rewards

Your personality:
- Speak in a warm, elegant, and helpful manner befitting a palace concierge
- Use Hindi greetings like "Namaste" occasionally
- Be concise but informative
- Always offer to connect the guest with staff for bookings
- Be enthusiastic about the hotel's offerings
- If asked about something you don't know, politely suggest calling the hotel

Keep responses SHORT and helpful (2-3 sentences max). Use occasional emojis sparingly.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Try Groq first, then fallback options
    const apiKey = process.env.GROQ_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      // Fallback to predefined responses when no API key is configured
      return NextResponse.json({
        message: getFallbackResponse(messages[messages.length - 1]?.content || ''),
      })
    }

    // Groq API (default — free tier with generous limits)
    if (process.env.GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-10), // Last 10 messages for context
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      })

      if (!response.ok) throw new Error('Groq API error')
      const data = await response.json()
      return NextResponse.json({ message: data.choices[0].message.content })
    }

    // OpenRouter fallback
    if (process.env.OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://shardapalace.in',
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

      if (!response.ok) throw new Error('OpenRouter API error')
      const data = await response.json()
      return NextResponse.json({ message: data.choices[0].message.content })
    }

    // Google Gemini fallback
    if (process.env.GOOGLE_AI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
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

      if (!response.ok) throw new Error('Gemini API error')
      const data = await response.json()
      return NextResponse.json({
        message: data.candidates[0].content.parts[0].text,
      })
    }

    return NextResponse.json({
      message: getFallbackResponse(messages[messages.length - 1]?.content || ''),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      message: getFallbackResponse(''),
    })
  }
}

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('room') || q.includes('stay') || q.includes('book')) {
    return 'We have Deluxe, Super Deluxe, and Royal Suite rooms — all with modern amenities. Would you like to call us for booking? 📞'
  }
  if (q.includes('menu') || q.includes('food') || q.includes('restaurant') || q.includes('eat')) {
    return 'Our restaurant serves North Indian, Mughlai, Chinese, and Continental cuisine. Check out our digital menu on the Menu page! 🍛'
  }
  if (q.includes('event') || q.includes('wedding') || q.includes('banquet') || q.includes('lawn') || q.includes('marriage')) {
    return 'Our Marriage Lawn and AC Banquet Hall are perfect for weddings, receptions, and celebrations. Call us to discuss your event! 🎉'
  }
  if (q.includes('coin') || q.includes('loyalty') || q.includes('reward') || q.includes('points')) {
    return 'With Sharda Coins, earn rewards every time you dine or stay! Redeem coins for discounts on your next visit. Check the Coins page for details! 🪙'
  }
  if (q.includes('location') || q.includes('address') || q.includes('where') || q.includes('direction')) {
    return 'We are located in Bijnor, Uttar Pradesh. Search "Sharda Palace Bijnor" on Google Maps for directions! 📍'
  }
  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('charge')) {
    return 'Room rates vary by type and season. Restaurant meals are very affordable. Call us for specific pricing! 💰'
  }
  if (q.includes('travel') || q.includes('tour') || q.includes('trip') || q.includes('package')) {
    return 'We offer amazing travel packages — pilgrimage tours, leisure trips, and group tours. Visit our Travel page or call us for details! ✈️'
  }
  if (q.includes('checkout') || q.includes('check-in') || q.includes('checkin') || q.includes('check in')) {
    return 'Check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in or late checkout may be available — call to arrange! 🕐'
  }

  return `Namaste! 🙏 Thank you for your interest in Sharda Palace. For immediate assistance, please call us at +91 ${process.env.NEXT_PUBLIC_HOTEL_PHONE || '7303584266'} or use the WhatsApp button. We'd love to help!`
}
