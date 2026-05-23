// All icons share: 2.5px stroke, brown-700 (#2E2416), playful curves

const baseProps = {
  fill: 'none',
  stroke: '#2E2416',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconEgg({ size = 28, fill = '#FCE9B8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <ellipse cx="16" cy="18" rx="10" ry="12" fill={fill} {...baseProps} />
      <circle cx="13" cy="15" r="0.8" fill="#B89968" stroke="none" />
      <circle cx="19" cy="20" r="0.8" fill="#B89968" stroke="none" />
      <circle cx="15" cy="23" r="0.6" fill="#B89968" stroke="none" />
    </svg>
  )
}

export function IconMagnifier({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="14" cy="14" r="8" fill="#FCE9B8" {...baseProps} />
      <line x1="20" y1="20" x2="26" y2="26" {...baseProps} />
      <circle cx="12" cy="12" r="2" fill="#FFFDF7" stroke="none" />
    </svg>
  )
}

export function IconEye({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path d="M 4 16 Q 16 6 28 16 Q 16 26 4 16 Z" fill="#FCE9B8" {...baseProps} />
      <circle cx="16" cy="16" r="4" fill="#2E2416" stroke="none" />
      <circle cx="17.5" cy="14.5" r="1.2" fill="#FFFDF7" stroke="none" />
    </svg>
  )
}

export function IconTools({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      {/* Hammer */}
      <rect x="5" y="10" width="10" height="6" rx="1.5" fill="#F5B544" {...baseProps} />
      <line x1="10" y1="16" x2="6" y2="26" {...baseProps} />
      {/* Wrench */}
      <path
        d="M 22 6 a 4 4 0 1 0 3 7 l 4 4 l 2 -2 l -4 -4 a 4 4 0 0 0 -5 -5 z"
        fill="#FCE9B8"
        {...baseProps}
      />
    </svg>
  )
}

export function IconCone({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      {/* Traffic cone */}
      <path d="M 11 24 L 16 6 L 21 24 Z" fill="#F5B544" {...baseProps} />
      <line x1="12.5" y1="18" x2="19.5" y2="18" {...baseProps} />
      <rect x="6" y="24" width="20" height="3" rx="1" fill="#FCE9B8" {...baseProps} />
    </svg>
  )
}

export function IconSparkle({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path
        d="M 16 4 L 18 14 L 28 16 L 18 18 L 16 28 L 14 18 L 4 16 L 14 14 Z"
        fill="#F5B544"
        {...baseProps}
      />
      <circle cx="25" cy="7" r="1.5" fill="#F5B544" {...baseProps} />
      <circle cx="7" cy="25" r="1" fill="#F5B544" {...baseProps} />
    </svg>
  )
}

export function IconShare({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="6" cy="12" r="2.5" fill="#FCE9B8" {...baseProps} />
      <circle cx="18" cy="6" r="2.5" fill="#FCE9B8" {...baseProps} />
      <circle cx="18" cy="18" r="2.5" fill="#FCE9B8" {...baseProps} />
      <line x1="8.2" y1="10.8" x2="15.8" y2="7.2" {...baseProps} />
      <line x1="8.2" y1="13.2" x2="15.8" y2="16.8" {...baseProps} />
    </svg>
  )
}

export function IconBrokenEgg({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* Top half */}
      <path
        d="M 20 8 L 25 18 L 22 24 L 28 22 L 32 30 L 38 24 L 44 28 Q 48 16 32 6 Q 24 6 20 8 Z"
        fill="#FCE9B8"
        {...baseProps}
      />
      {/* Bottom half */}
      <path
        d="M 14 32 Q 12 56 32 58 Q 52 56 50 32 L 44 36 L 38 30 L 32 36 L 26 30 L 20 36 Z"
        fill="#FCE9B8"
        {...baseProps}
      />
    </svg>
  )
}

export function IconTwitter({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2E2416">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}