'use client'

import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now()
  if (!Number.isFinite(diff) || diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface CountdownTimerProps {
  targetDate: string // ISO string, npr. '2026-06-12T17:00:00'
  variant?: 'dark' | 'light'
}

export default function CountdownTimer({ targetDate, variant = 'dark' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const target = new Date(targetDate)
    const update = () => setTimeLeft(getTimeLeft(target))

    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const units = [
    { label: 'Dana', value: timeLeft?.days },
    { label: 'Sati', value: timeLeft?.hours },
    { label: 'Minuta', value: timeLeft?.minutes },
    { label: 'Sekundi', value: timeLeft?.seconds },
  ]

  return (
    <section className={variant === 'light' ? 'px-4 py-11 text-center sm:py-12' : 'py-20 px-6 text-center'} style={{ background: variant === 'light' ? 'var(--cream)' : 'var(--ink)' }}>
      <p
        className="font-montserrat text-[10px] tracking-[0.3em] uppercase mb-3"
        style={{ color: variant === 'light' ? 'var(--gold)' : 'var(--gold-lt)' }}
      >
        Do vencanja
      </p>
      <h2
        className={variant === 'light' ? 'mb-6 font-great-vibes' : 'font-great-vibes mb-8'}
        style={{ fontSize: variant === 'light' ? 'clamp(34px,7vw,50px)' : 'clamp(42px,9vw,68px)', color: variant === 'light' ? 'var(--rose-dk)' : 'white', lineHeight: 1.1 }}
      >
        Odbrojavamo dane
      </h2>

      <div className="flex justify-center items-start" style={{ gap: variant === 'light' ? 'clamp(5px,2vw,18px)' : 'clamp(16px,5vw,60px)' }}>
        {units.map((unit, i) => (
          <div key={unit.label} className="contents">
            <div className="flex flex-col items-center gap-2">
              <span
                className="font-cormorant font-light leading-none tabular-nums"
                style={{ fontSize: variant === 'light' ? 'clamp(28px,7vw,48px)' : 'clamp(48px,12vw,90px)', color: variant === 'light' ? 'var(--ink)' : 'var(--rose-lt)' }}
              >
                {unit.value === undefined ? '--' : pad(unit.value)}
              </span>
              <span
                className="font-montserrat text-[10px] tracking-[0.25em] uppercase"
                style={{ color: variant === 'light' ? 'var(--ink-lt)' : 'oklch(70% 0.01 70)' }}
              >
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                className="font-cormorant font-light pt-0.5 opacity-50"
                style={{ fontSize: variant === 'light' ? 'clamp(22px,5vw,34px)' : 'clamp(40px,10vw,80px)', color: 'var(--gold)' }}
              >
                ·
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
