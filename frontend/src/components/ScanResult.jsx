import { useRef } from 'react'
import VerdictCard from './VerdictCard'
import ShareButton from './ShareButton'
import ProfileHeader from './ProfileHeader'
import InsightCard from './InsightCard'
import DetailedStats from './DetailedStats'
import KeyRepositories from './KeyRepositories'
import {
  IconEye,
  IconTools,
  IconCone,
  IconSparkle,
} from './Icons'

export default function ScanResult({ data }) {
  const resultRef = useRef(null)

  return (
    <div className="space-y-5 mt-10 animate-[pop_0.4s_ease-out]">
      <div ref={resultRef} className="space-y-5 bg-[#FFFDF7] p-2 rounded-xl -m-2">
        <ProfileHeader data={data} />

        <VerdictCard
          verdict={data.eggVerdict}
          score={data.eggScore}
        />

        <InsightCard
          icon={<IconEye />}
          title="Recruiter first impression"
          rotate="-rotate-1"
        >
          <p className="text-brown-600 leading-relaxed">
            {data.firstImpression}
          </p>
        </InsightCard>

        <InsightCard
          icon={<IconTools />}
          title="Skills your repos actually show"
          rotate="rotate-1"
        >
          <div className="flex flex-wrap gap-2">
            {data.skills.length === 0 && (
              <span className="text-brown-400 text-sm italic">
                Nothing concrete detected.
              </span>
            )}

            {data.skills.map((skill) => (
              <span key={skill} className="chip">
                {skill}
              </span>
            ))}
          </div>
        </InsightCard>

        <InsightCard
          icon={<IconCone />}
          title="What's missing / how to improve"
          rotate="-rotate-1"
        >
          <ul className="space-y-2.5">
            {data.improvements.map((improvement, idx) => (
              <li
                key={idx}
                className="flex gap-3 text-brown-600"
              >
                <span className="text-yolk font-bold mt-0.5 shrink-0">
                  →
                </span>

                <span className="leading-relaxed">
                  {improvement}
                </span>
              </li>
            ))}
          </ul>
        </InsightCard>

        <InsightCard
          icon={<IconSparkle />}
          title="Your vibe as a developer"
          rotate="rotate-1"
        >
          <p className="text-brown-600 font-display font-semibold text-xl">
            {data.vibe}
          </p>
        </InsightCard>

        <DetailedStats data={data} />

        <KeyRepositories data={data} />
      </div>

      {/* Share footer */}
      <ShareButton data={data} resultRef={resultRef} />
    </div>
  )
}
