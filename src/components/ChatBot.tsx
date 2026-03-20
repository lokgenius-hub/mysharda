'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, Crown } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const FEATURES = (process.env.NEXT_PUBLIC_FEATURES || 'hotel,events,travel,restaurant,menu,pos,coins,gallery,blog')
  .split(',').map(f => f.trim())
const hf = {
  hotel:      FEATURES.includes('hotel'),
  events:     FEATURES.includes('events'),
  restaurant: FEATURES.includes('restaurant') || FEATURES.includes('menu'),
  travel:     FEATURES.includes('travel'),
  coins:      FEATURES.includes('coins'),
}

// Suggested questions filtered to only what this tenant offers
const SUGGESTED_QUESTIONS = [
  hf.hotel      && 'What rooms are available?',
  hf.restaurant && "What's on the menu?",
  hf.events     && 'Tell me about the banquet hall',
  hf.coins      && 'How do loyalty coins work?',
  hf.travel     && 'What travel packages do you offer?',
].filter(Boolean) as string[]

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const hotelName = process.env.NEXT_PUBLIC_HOTEL_NAME || 'our hotel'

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Namaste! 🙏 Welcome to ${hotelName}. I'm your AI concierge. How may I assist you today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const allMessages = [...messages, userMessage]

    try {
      // Supabase Edge Function — works on GitHub Pages, no backend needed.
      // GROQ_API_KEY is a Supabase secret (never exposed to browser).
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const tenantId    = process.env.NEXT_PUBLIC_TENANT_ID || 'sharda'

      if (!supabaseUrl || !anonKey || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase not configured')
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ messages: allMessages, tenant_id: tenantId, features: FEATURES }),

      })

      if (!response.ok) throw new Error('Edge function error')

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ])
    } catch {
      // Local keyword fallback — works offline, no server needed
      const lastText = allMessages[allMessages.length - 1]?.content?.toLowerCase() ?? ''
      let fallbackMsg = 'Namaste! 🙏 Please use our Contact page or call us directly for immediate assistance.'
      if (hf.hotel && (lastText.includes('room') || lastText.includes('stay')))
        fallbackMsg = 'We offer Deluxe, Super Deluxe, and Royal Suite rooms. Please use our Contact page to enquire about availability! 🏨'
      else if (hf.restaurant && (lastText.includes('food') || lastText.includes('menu') || lastText.includes('restaurant')))
        fallbackMsg = 'Our restaurant serves North Indian, Mughlai, Chinese, and Continental cuisine. Check the Menu page for details! 🍛'
      else if (hf.events && (lastText.includes('wedding') || lastText.includes('event') || lastText.includes('banquet')))
        fallbackMsg = 'Our banquet hall and lawn are perfect for weddings and celebrations. Use the Contact page to get a quote! 🎉'
      else if (hf.travel && (lastText.includes('travel') || lastText.includes('tour')))
        fallbackMsg = 'We offer pilgrimage tours, leisure trips, and group packages. Visit our Travel page! ✈️'
      else if (hf.coins && (lastText.includes('coin') || lastText.includes('loyalty')))
        fallbackMsg = 'Earn loyalty coins every time you dine — redeem for discounts on future visits! 🪙'
      setMessages((prev) => [...prev, { role: 'assistant', content: fallbackMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30 hover:scale-110 transition-transform"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open AI Concierge"
          >
            <Bot className="w-7 h-7 text-[var(--bg-deep)]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[400px] z-50 bg-[var(--bg-card)] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden border border-[var(--primary)]/10 max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--bg-deep)] to-[var(--bg-card)] p-4 flex items-center justify-between border-b border-[var(--primary)]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[var(--bg-deep)]" />
                </div>
                <div>
                  <h3 className="text-[var(--primary)] font-semibold text-sm">Royal Concierge</h3>
                  <p className="text-white/40 text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI-powered assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-[var(--primary)] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh] bg-[var(--bg-deep)]/50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary)] text-[var(--bg-deep)] rounded-br-md font-medium'
                        : 'bg-white/5 text-white/80 rounded-bl-md border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-md border border-white/5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto bg-[var(--bg-deep)]/50">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="shrink-0 px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-full border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-[var(--bg-card)] border-t border-white/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${[hf.restaurant && 'menu', hf.hotel && 'rooms', hf.events && 'events'].filter(Boolean).join(', ') || 'anything'}...`}
                  className="flex-1 px-4 py-2.5 bg-white/5 rounded-xl text-sm text-white border border-white/10 focus:border-[var(--primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-white/30"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-[var(--bg-deep)] rounded-xl hover:shadow-md transition-all disabled:opacity-50 font-medium"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
