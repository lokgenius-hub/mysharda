'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, Crown } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  'What rooms do you have?',
  'Tell me about the banquet hall',
  "What's on the menu?",
  'How do Sharda Coins work?',
]

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Namaste! 🙏 Welcome to Sharda Palace. I\'m your AI concierge. How may I assist you today?',
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
      // Primary: Supabase Edge Function — works on GitHub Pages, no backend needed.
      // GROQ_API_KEY is a Supabase secret (never exposed to browser).
      // The anon key used here is safe — it's designed to be public (RLS protects data).
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      let response: Response | null = null

      if (supabaseUrl && anonKey && !supabaseUrl.includes('placeholder')) {
        response = await fetch(`${supabaseUrl}/functions/v1/chat-ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
          },
          body: JSON.stringify({ messages: allMessages }),
        })
      }

      // Fallback: local backend API route (when running npm run dev/start)
      if (!response || !response.ok) {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages }),
        })
      }

      if (!response.ok) throw new Error('No AI response')

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            `I apologize, I'm having trouble connecting. Please call us at +91 ${process.env.NEXT_PUBLIC_HOTEL_PHONE || '7303584266'} for immediate assistance. 🙏`,
        },
      ])
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
            className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-[#c9a84c] to-[#a88a3a] rounded-full flex items-center justify-center shadow-lg shadow-[#c9a84c]/30 hover:scale-110 transition-transform"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open AI Concierge"
          >
            <Bot className="w-7 h-7 text-[#0f0f23]" />
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
            className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[400px] z-50 bg-[#1a1a2e] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden border border-[#c9a84c]/10 max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f0f23] to-[#1a1a2e] p-4 flex items-center justify-between border-b border-[#c9a84c]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#a88a3a] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#0f0f23]" />
                </div>
                <div>
                  <h3 className="text-[#c9a84c] font-semibold text-sm">Royal Concierge</h3>
                  <p className="text-white/40 text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI-powered assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-[#c9a84c] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh] bg-[#0f0f23]/50">
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
                        ? 'bg-[#c9a84c] text-[#0f0f23] rounded-br-md font-medium'
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
                      <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto bg-[#0f0f23]/50">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="shrink-0 px-3 py-1.5 bg-[#c9a84c]/10 text-[#c9a84c] text-xs rounded-full border border-[#c9a84c]/20 hover:bg-[#c9a84c]/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-[#1a1a2e] border-t border-white/5">
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
                  placeholder="Ask about rooms, events, menu..."
                  className="flex-1 px-4 py-2.5 bg-white/5 rounded-xl text-sm text-white border border-white/10 focus:border-[#c9a84c]/30 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/10 placeholder:text-white/30"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] text-[#0f0f23] rounded-xl hover:shadow-md transition-all disabled:opacity-50 font-medium"
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
