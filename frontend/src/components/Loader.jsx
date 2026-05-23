import { useEffect, useState } from 'react'

const STAGES = [
  'Sneaking into your profile…',
  'Counting your repos…',
  'Reading your READMEs…',
  'Asking the AI for the truth…',
  'Almost cracked…',
]

export default function Loader() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(x => Math.min(x + 1, STAGES.length - 1)), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 py-16">
      <BouncingEgg />
      <p className="text-brown-500 font-semibold text-lg">{STAGES[i]}</p>
      <div className="flex gap-1.5 mt-1">
        {STAGES.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx <= i ? 'bg-yolk w-6' : 'bg-brown-100 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function BouncingEgg() {
  return (
    <div className="relative w-20 h-24">
      <svg
        className="absolute inset-0 animate-bounce-slow"
        viewBox="0 0 80 96"
        style={{ filter: 'drop-shadow(0 4px 0 #2E2416)' }}
      >
        <ellipse cx="40" cy="52" rx="28" ry="36" fill="#FCE9B8" stroke="#2E2416" strokeWidth="3" />
        <circle cx="26" cy="44" r="1.5" fill="#B89968" />
        <circle cx="50" cy="40" r="1.2" fill="#B89968" />
        <circle cx="54" cy="62" r="1.5" fill="#B89968" />
        {/* dizzy eyes */}
        <path d="M 28 52 L 34 56 M 28 56 L 34 52" stroke="#2E2416" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 46 52 L 52 56 M 46 56 L 52 52" stroke="#2E2416" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 35 64 Q 40 68 45 64" stroke="#2E2416" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}