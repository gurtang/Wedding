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
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface CountdownTimerProps {
  targetDate: string // ISO string, npr. '2026-06-12T17:00:00'
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const target = new Date(targetDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(target))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const units = [
    { label: 'Dana',    value: timeLeft.days },
    { label: 'Sati',    value: timeLeft.hours },
    { label: 'Minuta',  value: timeLeft.minutes },
    { label: 'Sekundi', value: timeLeft.seconds },
  ]

  return (
    <section className="py-20 px-6 text-center" style={{ background: 'var(--ink)' }}>
      <p
        className="font-montserrat text-[10px] tracking-[0.3em] uppercase mb-3"
        style={{ color: 'var(--gold-lt)' }}
      >
        Do venčanja
      </p>
      <h2
        className="font-great-vibes mb-8"
        style={{ fontSize: 'clamp(42px,9vw,68px)', color: 'white', lineHeight: 1.1 }}
      >
        Odbrojavamo dane
      </h2>

      <div className="flex justify-center items-start" style={{ gap: 'clamp(16px,5vw,60px)' }}>
        {units.map((unit, i) => (
          <>
            <div key={unit.label} className="flex flex-col items-center gap-2">
              <span
                className="font-cormorant font-light leading-none tabular-nums"
                style={{ fontSize: 'clamp(48px,12vw,90px)', color: 'var(--rose-lt)' }}
              >
                {pad(unit.value)}
              </span>
              <span
                className="font-montserrat text-[10px] tracking-[0.25em] uppercase"
                style={{ color: 'oklch(70% 0.01 70)' }}
              >
                {unit.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                key={`sep-${i}`}
                className="font-cormorant font-light pt-0.5 opacity-50"
                style={{ fontSize: 'clamp(40px,10vw,80px)', color: 'var(--gold)' }}
              >
                ·
              </span>
            )}
          </>
        ))}
      </div>
    </section>
  )
}
