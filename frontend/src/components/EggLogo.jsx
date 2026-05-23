export default function EggLogo({ size = 72, animated = false }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      className={animated ? 'animate-float' : ''}
      style={{ filter: 'drop-shadow(0 5px 0 #2E2416)' }}
    >
      {/* Egg body */}
      <ellipse cx="40" cy="52" rx="32" ry="40" fill="#FCE9B8" stroke="#2E2416" strokeWidth="3" />

      {/* Speckles */}
      <circle cx="22" cy="38" r="1.8" fill="#B89968" />
      <circle cx="54" cy="34" r="1.4" fill="#B89968" />
      <circle cx="58" cy="62" r="1.8" fill="#B89968" />
      <circle cx="20" cy="68" r="1.4" fill="#B89968" />
      <circle cx="46" cy="78" r="1.6" fill="#B89968" />
      <circle cx="30" cy="48" r="1" fill="#B89968" />

      {/* Eyes — closed/content arcs */}
      <path d="M 28 54 Q 32 50 36 54" stroke="#2E2416" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M 44 54 Q 48 50 52 54" stroke="#2E2416" strokeWidth="2.8" fill="none" strokeLinecap="round" />

      {/* Smile */}
      <path d="M 33 64 Q 40 70 47 64" stroke="#2E2416" strokeWidth="2.8" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <ellipse cx="24" cy="62" rx="3.5" ry="2.5" fill="#F5B544" opacity="0.55" />
      <ellipse cx="56" cy="62" rx="3.5" ry="2.5" fill="#F5B544" opacity="0.55" />
    </svg>
  )
}