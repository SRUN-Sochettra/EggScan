import VerdictIllustration from './VerdictIllustration'

const VERDICT_STYLES = {
  'Golden Egg':  { bg: '#FFE9A8', accent: '#F5B544', tag: 'recruiter ready',      illustration: 'golden' },
  'Hard Boiled': { bg: '#F4E4C1', accent: '#B89968', tag: 'solid profile',        illustration: 'hard' },
  'Fresh Egg':   { bg: '#FCE9B8', accent: '#F5B544', tag: 'just getting started', illustration: 'fresh' },
  'Cracked':     { bg: '#F8D5C8', accent: '#C84A2E', tag: 'needs work',           illustration: 'cracked' },
  'Scrambled':   { bg: '#EFD8C9', accent: '#8B6F47', tag: 'do not apply yet',     illustration: 'scrambled' },
}

export default function VerdictCard({ verdict, score }) {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES['Fresh Egg']

  return (
    <div
      className="card p-8 text-center relative overflow-hidden"
      style={{ background: style.bg }}
    >
      {/* Decorative speckles */}
      <div className="absolute top-8 right-10 w-1.5 h-1.5 rounded-full bg-brown-300 opacity-50"></div>
      <div className="absolute bottom-6 left-12 w-1 h-1 rounded-full bg-brown-300 opacity-40"></div>
      <div className="absolute bottom-10 right-8 w-2 h-2 rounded-full bg-brown-300 opacity-40"></div>
      <div className="absolute top-12 left-8 w-1 h-1 rounded-full bg-brown-300 opacity-40"></div>

      <div className="flex justify-center mb-4 animate-float">
        <VerdictIllustration type={style.illustration} />
      </div>

      <h2 className="font-display font-black text-4xl text-brown-700 leading-none">
        {verdict}
      </h2>
      <p className="text-brown-500 mt-2 font-medium italic">{style.tag}</p>

      <div className="mt-6 max-w-xs mx-auto">
        <div className="flex justify-between text-sm font-bold text-brown-600 mb-1.5">
          <span>egg score</span>
          <span>{score}/100</span>
        </div>
        <div className="w-full bg-brown-50 h-3 rounded-full border-2 border-brown-700 overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${score}%`, background: style.accent }}
          />
        </div>
      </div>
    </div>
  )
}