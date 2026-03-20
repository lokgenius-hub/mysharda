'use client'
/**
 * HeroSlider — full-screen crossfade carousel for the homepage hero.
 * Uses existing image slots: heroHome, heroHotel, heroEvents, ctaBanner, heroRestaurant
 * Auto-advances every 5 seconds. Pause on hover/touch. Prev/next arrows + dot nav.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  src: string
  alt: string
}

interface HeroSliderProps {
  slides: Slide[]
  interval?: number   // ms between auto-advance (default 5000)
  className?: string
}

export default function HeroSlider({ slides, interval = 5000, className = '' }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [next, setNext]       = useState<number | null>(null)   // slide fading in
  const [transitioning, setTransitioning] = useState(false)
  const pausedRef   = useRef(false)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const validSlides = slides.filter(s => s.src)
  const count = validSlides.length

  const goTo = useCallback((idx: number) => {
    if (count < 2 || transitioning) return
    const target = ((idx % count) + count) % count
    if (target === current) return
    setNext(target)
    setTransitioning(true)
    // After CSS transition (700ms), commit
    setTimeout(() => {
      setCurrent(target)
      setNext(null)
      setTransitioning(false)
    }, 700)
  }, [count, current, transitioning])

  // Auto-advance
  useEffect(() => {
    if (count < 2) return
    const tick = () => {
      if (!pausedRef.current) goTo(current + 1)
    }
    timerRef.current = setTimeout(tick, interval)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, count, interval, goTo])

  if (!count) return null
  if (count === 1) return (
    <div className={`absolute inset-0 ${className}`}>
      <Image src={validSlides[0].src} alt={validSlides[0].alt} fill priority className="object-cover object-center" />
    </div>
  )

  return (
    <div
      className={`absolute inset-0 select-none ${className}`}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
      onTouchStart={() => { pausedRef.current = true }}
      onTouchEnd={() => { pausedRef.current = false }}
    >
      {/* Base layer — current slide */}
      <Image
        key={`base-${current}`}
        src={validSlides[current].src}
        alt={validSlides[current].alt}
        fill priority
        className="object-cover object-center"
      />

      {/* Transition layer — next slide fades in */}
      {next !== null && (
        <Image
          key={`next-${next}`}
          src={validSlides[next].src}
          alt={validSlides[next].alt}
          fill
          className="object-cover object-center transition-opacity duration-700 ease-in-out"
          style={{ opacity: transitioning ? 1 : 0 }}
        />
      )}

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 border border-white/15 text-white hover:bg-black/70 hover:border-[var(--primary)]/50 transition-all flex items-center justify-center backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => goTo(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 border border-white/15 text-white hover:bg-black/70 hover:border-[var(--primary)]/50 transition-all flex items-center justify-center backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {validSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-6 h-2 bg-[var(--primary)]'
                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
