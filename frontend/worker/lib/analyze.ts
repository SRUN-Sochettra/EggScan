import type { Env } from '../types'
import { scanGitHub, fetchReadmes, fetchRepoEvidence, fetchCommits, fetchUserCommitMessages, fetchFile } from './github'
import { groqJson } from './groq'
import { AiInsightsSchema, BattleAiSchema, CommitShameSchema, DeepDiveSchema, ReadmeRaterSchema, StackRoastSchema } from './schemas'
import { getRecentScan, saveScan } from './db'

const tone = (value: string) => ({
  professional: 'Use a polite, constructive, professional tone.',
  roast: 'Use sharp but non-abusive comedic criticism.', hype: 'Use enthusiastic startup-style language.',
  pirate: 'Use light nautical phrasing while remaining clear.', parent: 'Use mildly disappointed but constructive language.',
  techbro: 'Use satirical startup jargon while remaining useful.', gordon: 'Use an intense fictional chef-reviewer tone without impersonating a real person.',
  honest: 'Use direct, specific, recruiter-style judgment.',
}[value] ?? 'Use direct, specific judgment.')

const verdictEmoji: Record<string, string> = { 'Golden Egg': '🥚✨', 'Hard Boiled': '🍳', 'Fresh Egg': '🐣', Cracked: '🥚💔', Scrambled: '🍳💀' }

export async function scan(env: Env, username: string, mode: string) {
  if (mode === 'honest') {
    const cached = await getRecentScan(env, username)
    if (cached) return cached
  }
  const data = await scanGitHub(env, username)
  const readmes = await fetchReadmes(env, username, data.repos, 5)
  data.reposWithReadme = Object.values(readmes).filter(Boolean).length
  const insights = await groqJson(env,
    `Analyze a developer GitHub profile. ${tone(mode)} Return JSON with firstImpression, skills, improvements, vibe, eggScore (0-100), and eggVerdict (Golden Egg, Hard Boiled, Fresh Egg, Cracked, or Scrambled). Be specific and do not use emojis.`,
    { profile: data.profile, repos: data.repos.slice(0, 10), statistics: { ...data, profile: undefined, repos: undefined, stats: undefined }, contributionStats: data.stats, readmes }, AiInsightsSchema)
  const result = {
    id: crypto.randomUUID(), username: data.profile.login, avatarUrl: data.profile.avatar_url,
    name: data.profile.name, bio: data.profile.bio, eggVerdict: insights.eggVerdict,
    eggEmoji: verdictEmoji[insights.eggVerdict] ?? '🥚', eggScore: insights.eggScore,
    firstImpression: insights.firstImpression, skills: insights.skills,
    improvements: insights.improvements, vibe: insights.vibe,
    rawData: { profile: data.profile, repos: data.repos, languageBreakdown: data.languageBreakdown, totalStars: data.totalStars, activeRepos: data.activeRepos, reposWithReadme: data.reposWithReadme, lastActivity: data.lastActivity },
    stats: data.stats,
  }
  if (mode === 'honest') await saveScan(env, result)
  return result
}

export async function battle(env: Env, u1: string, u2: string) {
  const [user1, user2] = await Promise.all([scan(env, u1, 'honest'), scan(env, u2, 'honest')])
  const ai = await groqJson(env, 'Compare two developer profiles. Return JSON with winner (exact username) and report (one entertaining but non-abusive paragraph).',
    { player1: user1, player2: user2 }, BattleAiSchema)
  const winnerUsername = [user1.username.toLowerCase(), user2.username.toLowerCase()].includes(ai.winner.toLowerCase()) ? ai.winner : user1.username
  return { user1, user2, winnerUsername, battleReport: ai.report }
}

export async function deepDive(env: Env, username: string, repo: string, branch: string) {
  const evidence = await fetchRepoEvidence(env, username, repo, branch)
  return groqJson(env, 'Perform a senior-engineer repository review. Return JSON with summary, architectureAndStack, codeStructureFeedback, commitQualityFeedback, and actionableImprovements. Do not claim to have inspected anything outside the supplied evidence.', evidence, DeepDiveSchema)
}

export async function shameCommits(env: Env, username: string, repo: string | undefined, selectedTone: string) {
  const commits = repo ? await fetchCommits(env, username, repo) : await fetchUserCommitMessages(env, username)
  return groqJson(env, `Review commit-message quality. ${tone(selectedTone)} Return JSON with summary, lazinessScore (0-100), worstCommits, and roast.`, { commits: commits.length ? commits : ['No recent commits found.'] }, CommitShameSchema)
}

export async function rateReadmes(env: Env, username: string, selectedTone: string) {
  const data = await scanGitHub(env, username)
  const readmes = await fetchReadmes(env, username, data.repos, 3)
  const profileReadme = await fetchFile(env, username, username, 'README.md')
  if (profileReadme) readmes[`${username}/${username} (Profile)`] = profileReadme
  return groqJson(env, `Review documentation quality. ${tone(selectedTone)} Return JSON with summary, uselessnessScore (0-100), nitpicks, and roast.`, { readmes }, ReadmeRaterSchema)
}

export async function roastStack(env: Env, username: string, selectedTone: string) {
  const data = await scanGitHub(env, username)
  const repos = data.repos.slice(0, 2)
  const evidence = await Promise.all(repos.map((repo) => fetchRepoEvidence(env, username, repo.name, repo.default_branch).catch(() => null)))
  return groqJson(env, `Review the technology stack. ${tone(selectedTone)} Return JSON with topLanguagesRoast, configDeepDiveRoast, and overallVerdict.`, { languages: data.languageBreakdown, repositories: evidence.filter(Boolean).map((item: any) => ({ configs: item.configs })) }, StackRoastSchema)
}
