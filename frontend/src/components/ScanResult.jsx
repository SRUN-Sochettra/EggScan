import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import VerdictCard from './VerdictCard'
import {
  IconEye,
  IconTools,
  IconCone,
  IconSparkle,
  IconShare,
  IconTwitter,
} from './Icons'

export default function ScanResult({ data }) {
  const resultRef = useRef(null)

  return (
    <div className="space-y-5 mt-10 animate-[pop_0.4s_ease-out]">
      <div ref={resultRef} className="space-y-5 bg-[#FFFDF7] p-2 rounded-xl -m-2">
      {/* Profile header */}
      <div className="card p-5 flex items-center gap-4">
        <img
          src={data.avatarUrl}
          alt=""
          className="w-16 h-16 rounded-full border-2 border-brown-700 shadow-eggsm"
        />

        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-xl text-brown-700 truncate">
            {data.name || data.username}
          </h2>

          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brown-400 hover:text-brown-600 font-medium"
          >
            @{data.username} ↗
          </a>

          {data.bio && (
            <p className="text-sm text-brown-500 mt-1 line-clamp-2">
              {data.bio}
            </p>
          )}
        </div>
      </div>

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

      <div className="card p-5 -rotate-1">
        <div className="flex items-center gap-3 mb-4">
           <h3 className="font-display text-lg font-bold text-brown-700">
             Detailed Stats
           </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Total Stars" value={data.rawData?.totalStars || 0} />
          <StatBox label="Commits (1y)" value={data.stats?.totalContributionsLastYear || 0} />
          <StatBox label="Issues Opened" value={data.stats?.totalIssues || 0} />
          <StatBox label="Pull Requests" value={data.stats?.totalPullRequests || 0} />
          <StatBox label="Active Repos" value={data.rawData?.activeRepos || 0} />
          <StatBox label="Repos w/ README" value={data.rawData?.reposWithReadme || 0} />
        </div>
        {data.rawData?.languageBreakdown && Object.keys(data.rawData.languageBreakdown).length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-brown-400 font-bold mb-2">Top Languages</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.rawData.languageBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([lang, count]) => (
                  <span key={lang} className="chip bg-white border border-brown-200">
                    {lang} <span className="text-brown-400 text-xs ml-1">({count})</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="card p-5 rotate-1">
        <div className="flex items-center gap-3 mb-4">
           <h3 className="font-display text-lg font-bold text-brown-700">
             Key Repositories
           </h3>
        </div>
        <div className="space-y-4">
          {data.stats?.pinnedRepos?.length > 0 ? (
            data.stats.pinnedRepos.map((repo, i) => <RepoItem key={i} repo={repo} />)
          ) : (
            data.rawData?.repos?.slice(0, 3).map((repo, i) => (
              <RepoItem key={i} repo={{
                name: repo.name,
                description: repo.description,
                primaryLanguage: repo.language,
                stars: repo.stargazers_count
              }} />
            ))
          )}
        </div>
      </div>
      </div>

      {/* Share footer */}
      <ShareButton data={data} resultRef={resultRef} />
    </div>
  )
}

function ShareButton({ data, resultRef }) {
  const [copied, setCopied] = useState(false)

  const buildShareText = () => {
    const topSkills = data.skills.slice(0, 3).join(', ')
    const tagline =
      TAGLINES[data.eggVerdict] || 'rated in eggs'

    const shareUrl = data.id ? `${window.location.origin}/?id=${data.id}` : window.location.origin

    return `I just got scanned on EggScan 🥚

Verdict: ${data.eggVerdict} — ${tagline}
Score: ${data.eggScore}/100
Vibe: ${data.vibe}
${topSkills ? `Top skills: ${topSkills}` : ''}

Get your GitHub rated in eggs ↓
${shareUrl}`
  }

  const handleShare = async () => {
    const text = buildShareText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: `EggScan — ${data.eggVerdict}`,
          text,
        })
        return
      } catch {
        // user cancelled → fall back to clipboard
      }
    }

    await navigator.clipboard.writeText(text)

    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const tweetUrl = () => {
    const tweet = `I'm a ${data.eggVerdict} on EggScan 🥚 (${data.eggScore}/100)

Vibe: ${data.vibe}

Get rated ↓`

    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweet
    )}&url=${encodeURIComponent(
      window.location.origin
    )}`
  }

  const handleDownload = async () => {
    if (!resultRef.current) return
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#FFFDF7',
        scale: 2,
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `eggscan-${data.username}.png`
      a.click()
    } catch (e) {
      console.error('Failed to generate image', e)
    }
  }

  return (
    <div
      className="card p-6 mt-2"
      style={{ background: '#FCE9B8' }}
    >
      <h3 className="font-display font-bold text-lg text-brown-700 text-center mb-1">
        Share your verdict
      </h3>

      <p className="text-brown-500 text-sm text-center mb-5">
        Flex on your timeline. Or warn your friends.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
        <button
          onClick={handleShare}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <IconShare size={18} />
          {copied ? 'Copied!' : 'Copy share text'}
        </button>

        <a
          href={tweetUrl()}
          target="_blank"
          rel="noreferrer"
          className="btn-primary inline-flex items-center justify-center gap-2"
          style={{ background: '#FFFDF7' }}
        >
          <IconTwitter size={18} />
          Post to X
        </a>

        <button
          onClick={handleDownload}
          className="btn-primary inline-flex items-center justify-center gap-2"
          style={{ background: '#FFFDF7' }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Image
        </button>
      </div>

      {/* Preview */}
      <div className="mt-5 p-4 bg-white/60 border-2 border-brown-700 border-dashed rounded-xl">
        <p className="text-xs uppercase tracking-wider text-brown-400 font-bold mb-2">
          preview
        </p>

        <pre className="text-xs text-brown-600 whitespace-pre-wrap font-sans leading-relaxed">
          {buildShareText()}
        </pre>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white/50 border border-brown-200 rounded-lg p-3 flex flex-col items-center justify-center text-center">
      <span className="text-2xl font-display font-bold text-brown-700">{value}</span>
      <span className="text-xs text-brown-500 uppercase tracking-wide font-semibold mt-1">{label}</span>
    </div>
  )
}

function RepoItem({ repo }) {
  return (
    <div className="border-b border-brown-200 last:border-0 pb-3 last:pb-0">
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-brown-700 break-all">{repo.name}</span>
        <div className="flex items-center gap-2 text-xs font-semibold text-brown-500 whitespace-nowrap ml-2">
          {repo.primaryLanguage && <span>{repo.primaryLanguage}</span>}
          <span className="flex items-center gap-0.5">★ {repo.stars}</span>
        </div>
      </div>
      {repo.description && <p className="text-sm text-brown-500 line-clamp-2">{repo.description}</p>}
    </div>
  )
}

function InsightCard({
  icon,
  title,
  rotate = '',
  children,
}) {
  return (
    <div className={`card p-5 ${rotate}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-yolk/20 flex items-center justify-center">
          {icon}
        </div>

        <h3 className="font-display text-lg font-bold text-brown-700">
          {title}
        </h3>
      </div>

      {children}
    </div>
  )
}

const TAGLINES = {
  'Golden Egg': 'recruiter ready',
  'Hard Boiled': 'solid profile',
  'Fresh Egg': 'just getting started',
  Cracked: 'needs work',
  Scrambled: 'do not apply yet',
}