'use client'

import { useState } from 'react'

interface EnvelopeAnimationProps {
  onOpen: () => void
}

export default function EnvelopeAnimation({ onOpen }: EnvelopeAnimationProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleClick = () => {
    if (isOpening) return
    setIsOpening(true)
    setTimeout(() => {
      onOpen()
    }, 1200)
  }

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'var(--cream2)' }}
    >
      {/* Envelope wrapper */}
      <div
        className="relative transition-transform duration-200 hover:scale-[1.035]"
        style={{ width: 320, height: 220, filter: 'drop-shadow(0 18px 40px oklch(60% 0.08 10 / 0.22))' }}
      >
        {/* Card that slides out */}
        <div
          className={`absolute left-1/2 top-1/2 z-[5] pointer-events-none text-center
            border rounded-sm px-5 py-6
            transition-[opacity,transform] duration-700
            ${isOpening
              ? 'opacity-100 -translate-x-1/2 -translate-y-[115%] delay-[450ms]'
              : 'opacity-0 -translate-x-1/2 translate-y-[10%]'
            }`}
          style={{
            width: 240,
            background: 'white',
            borderColor: 'var(--gold-lt)',
          }}
        >
          <p className="font-great-vibes text-[38px] leading-none" style={{ color: 'var(--rose-dk)' }}>
            M&amp;S
          </p>
          <p
            className="font-montserrat text-[12px] tracking-[0.18em] uppercase mt-1.5"
            style={{ color: 'var(--ink-lt)' }}
          >
            12 · 06 · 2026
          </p>
        </div>

        {/* SVG Envelope */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 320 220"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(96% 0.015 70)" />
              <stop offset="100%" stopColor="oklch(92% 0.022 70)" />
            </linearGradient>
            <linearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(92% 0.025 70)" />
              <stop offset="100%" stopColor="oklch(88% 0.03 10)" />
            </linearGradient>
            <radialGradient id="sealGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="oklch(68% 0.11 10)" />
              <stop offset="100%" stopColor="oklch(52% 0.09 10)" />
            </radialGradient>
          </defs>

          {/* Body */}
          <rect x="8" y="60" width="304" height="152" rx="3" fill="url(#bodyGrad)" />
          {/* Side triangles */}
          <polygon points="8,60 160,148 8,212" fill="oklch(89% 0.028 70)" />
          <polygon points="312,60 160,148 312,212" fill="oklch(91% 0.022 70)" />
          {/* Bottom triangle */}
          <polygon points="8,212 160,148 312,212" fill="oklch(93% 0.02 70)" />
          {/* Border */}
          <rect x="8" y="60" width="304" height="152" rx="3" fill="none" stroke="oklch(82% 0.06 75)" strokeWidth="0.8" />
          {/* Inner dashed border */}
          <rect x="16" y="68" width="288" height="136" rx="2" fill="none" stroke="oklch(85% 0.05 75)" strokeWidth="0.5" strokeDasharray="4,3" />

          {/* Flap — animated */}
          <polygon
            points="8,62 312,62 160,148"
            fill="url(#flapGrad)"
            stroke="oklch(82% 0.06 75)"
            strokeWidth="0.8"
            style={{
              transformOrigin: 'center top',
              transformBox: 'fill-box',
              animation: isOpening ? 'flapOpen 0.85s cubic-bezier(0.4,0,0.2,1) forwards' : 'none',
            }}
          />

          {/* Wax seal */}
          <circle cx="160" cy="148" r="22" fill="url(#sealGrad)" />
          <circle cx="160" cy="148" r="18" fill="none" stroke="oklch(80% 0.08 10)" strokeWidth="0.8" />
          <text
            x="160" y="152"
            textAnchor="middle"
            fontFamily="'Great Vibes', cursive"
            fontSize="14"
            fill="oklch(96% 0.01 10)"
          >
            M&amp;S
          </text>
        </svg>
      </div>

      {/* Hint */}
      <p
        className="font-montserrat text-[11px] tracking-[0.25em] uppercase mt-7 animate-wedding-pulse"
        style={{ color: 'var(--ink-lt)' }}
      >
        Dodirnite da otvorite
      </p>
    </div>
  )
}
