'use client'

import { useEffect, useRef } from 'react'

// Floral corner SVG – reusable
function FloralCorner() {
  return (
    <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g stroke="oklch(52% 0.09 10)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 270 C40 220 80 160 130 100 C160 65 200 35 260 10" strokeWidth="1.4" />
        <path d="M55 195 C45 175 30 168 18 172 C30 178 48 185 55 195Z" fill="oklch(65% 0.08 10)" strokeWidth="0.8" />
        <path d="M55 195 C65 178 78 170 90 173 C78 180 62 188 55 195Z" fill="oklch(65% 0.08 10)" strokeWidth="0.8" />
        <path d="M100 145 C88 128 72 120 58 124 C72 130 90 138 100 145Z" fill="oklch(65% 0.08 10)" strokeWidth="0.8" />
        <path d="M100 145 C112 128 128 120 142 123 C128 130 110 138 100 145Z" fill="oklch(65% 0.08 10)" strokeWidth="0.8" />
        <path d="M148 100 C136 82 120 74 106 78 C120 84 138 92 148 100Z" fill="oklch(65% 0.08 10)" strokeWidth="0.8" />
        <path d="M148 100 C160 82 176 74 190 77 C176 84 158 92 148 100Z" fill="oklch(65% 0.08 10)" strokeWidth="0.8" />
        <circle cx="55" cy="195" r="10" strokeWidth="1" stroke="oklch(58% 0.1 10)" />
        <circle cx="55" cy="195" r="6" strokeWidth="0.8" stroke="oklch(63% 0.09 10)" />
        <circle cx="55" cy="195" r="3" fill="oklch(66% 0.09 10)" stroke="none" />
        <circle cx="148" cy="100" r="12" strokeWidth="1" stroke="oklch(58% 0.1 10)" />
        <circle cx="148" cy="100" r="7" strokeWidth="0.8" stroke="oklch(63% 0.09 10)" />
        <circle cx="148" cy="100" r="3.5" fill="oklch(66% 0.09 10)" stroke="none" />
        <ellipse cx="30" cy="235" rx="5" ry="8" transform="rotate(-30 30 235)" fill="oklch(68% 0.08 10)" strokeWidth="0.7" />
        <ellipse cx="200" cy="50" rx="4" ry="7" transform="rotate(-50 200 50)" fill="oklch(68% 0.08 10)" strokeWidth="0.7" />
      </g>
    </svg>
  )
}

// Decorative monogram with gold ring
function MonogramLogo() {
  return (
    <div className="relative flex items-center justify-center mb-4" style={{ width: 'clamp(160px,28vw,220px)', height: 'clamp(160px,28vw,220px)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
        <circle cx="110" cy="110" r="104" fill="none" stroke="oklch(72% 0.1 75)" strokeWidth="0.7" opacity="0.5" />
        <circle cx="110" cy="110" r="96" fill="none" stroke="oklch(72% 0.1 75)" strokeWidth="0.4" opacity="0.35" strokeDasharray="2 4" />
        <g opacity="0.6" stroke="oklch(65% 0.09 75)" strokeWidth="0.9" fill="none">
          <path d="M110 8 C106 16 98 20 92 18 C100 14 108 10 110 8Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <path d="M110 8 C114 16 122 20 128 18 C120 14 112 10 110 8Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <line x1="110" y1="8" x2="110" y2="20" />
          <path d="M110 212 C106 204 98 200 92 202 C100 206 108 210 110 212Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <path d="M110 212 C114 204 122 200 128 202 C120 206 112 210 110 212Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <line x1="110" y1="200" x2="110" y2="212" />
          <path d="M8 110 C16 106 20 98 18 92 C14 100 10 108 8 110Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <path d="M8 110 C16 114 20 122 18 128 C14 120 10 112 8 110Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <line x1="8" y1="110" x2="20" y2="110" />
          <path d="M212 110 C204 106 200 98 202 92 C206 100 210 108 212 110Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <path d="M212 110 C204 114 200 122 202 128 C206 120 210 112 212 110Z" fill="oklch(78% 0.08 75)" stroke="none" />
          <line x1="200" y1="110" x2="212" y2="110" />
        </g>
        <circle cx="110" cy="6" r="2.5" fill="oklch(72% 0.1 75)" />
        <circle cx="110" cy="214" r="2.5" fill="oklch(72% 0.1 75)" />
        <circle cx="6" cy="110" r="2.5" fill="oklch(72% 0.1 75)" />
        <circle cx="214" cy="110" r="2.5" fill="oklch(72% 0.1 75)" />
      </svg>
      <span
        className="relative z-10 font-great-vibes leading-none"
        style={{ fontSize: 'clamp(62px,12vw,100px)', color: 'var(--rose-dk)' }}
      >
        M&amp;S
      </span>
    </div>
  )
}

interface HeroSectionProps {
  bride: string
  groom: string
  dateDisplay: string
}

export default function HeroSection({ bride, groom, dateDisplay }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll reveal
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal-on-scroll')
    if (!els) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-svh flex flex-col items-center justify-center text-center overflow-hidden px-6 py-20"
      style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 0%, oklch(90% 0.04 10 / 0.45), transparent), var(--cream)',
      }}
    >
      {/* Floral corners */}
      <div className="absolute top-[-20px] left-[-20px] w-[280px] pointer-events-none opacity-[0.18]">
        <FloralCorner />
      </div>
      <div className="absolute top-[-20px] right-[-20px] w-[280px] pointer-events-none opacity-[0.18] scale-x-[-1]">
        <FloralCorner />
      </div>
      <div className="absolute bottom-[-20px] left-[-20px] w-[200px] pointer-events-none opacity-[0.18] scale-y-[-1]">
        <FloralCorner />
      </div>
      <div className="absolute bottom-[-20px] right-[-20px] w-[200px] pointer-events-none opacity-[0.18] [transform:scale(-1,-1)]">
        <FloralCorner />
      </div>

      {/* Monogram */}
      <div className="reveal-on-scroll relative z-10">
        <MonogramLogo />
      </div>

      {/* Divider */}
      <div className="reveal-on-scroll flex items-center gap-4 my-3 relative z-10">
        <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, var(--gold))' }} />
        <div className="w-1.5 h-1.5 rotate-45 flex-shrink-0" style={{ background: 'var(--gold)' }} />
        <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, var(--gold))' }} />
      </div>

      {/* Names */}
      <h1
        className="reveal-on-scroll font-cormorant font-light tracking-[0.05em] relative z-10"
        style={{ fontSize: 'clamp(32px,7vw,56px)', color: 'var(--ink)' }}
      >
        {bride} &amp; {groom}
      </h1>

      {/* Subtitle */}
      <p
        className="reveal-on-scroll font-montserrat text-[11px] tracking-[0.28em] uppercase mt-5 relative z-10"
        style={{ color: 'var(--ink-lt)' }}
      >
        Pozivaju vas na venčanje
      </p>

      {/* Date */}
      <p
        className="reveal-on-scroll font-cormorant font-light italic relative z-10 mt-2"
        style={{ fontSize: 'clamp(18px,4vw,28px)', color: 'var(--rose-dk)' }}
      >
        {dateDisplay}
      </p>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-9 left-1/2 flex flex-col items-center gap-2 animate-wedding-float"
        style={{ color: 'var(--ink-lt)' }}
      >
        <span className="font-montserrat text-[10px] tracking-[0.2em] uppercase">Skroluj</span>
        <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
      </div>
    </section>
  )
}
