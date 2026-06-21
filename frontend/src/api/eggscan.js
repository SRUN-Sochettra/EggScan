const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function handleResponse(res, defaultErrorMessage) {
  if (!res.ok) {
    const err = await res.json().catch((e) => {
      console.error('Failed to parse error response:', e)
      return {}
    })
    throw new Error(err.error || defaultErrorMessage)
  }
  return res.json()
}

export async function scanGithub(username, mode = 'honest') {
  const res = await fetch(`${BASE}/api/scan/${encodeURIComponent(username)}?mode=${encodeURIComponent(mode)}`)
  return handleResponse(res, 'Scan failed')
}

export async function battleGithub(u1, u2) {
  const res = await fetch(`${BASE}/api/battle?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`)
  return handleResponse(res, 'Battle failed')
}

export async function getLeaderboard() {
  const res = await fetch(`${BASE}/api/leaderboard`)
  return handleResponse(res, 'Failed to fetch leaderboard')
}

export async function getScanResult(id) {
  const res = await fetch(`${BASE}/api/scan/result/${encodeURIComponent(id)}`)
  return handleResponse(res, 'Scan failed')
}

export async function deepDiveRepo(username, repoName, defaultBranch = 'main') {
  const res = await fetch(`${BASE}/api/scan/${encodeURIComponent(username)}/repo/${encodeURIComponent(repoName)}?defaultBranch=${encodeURIComponent(defaultBranch)}`)
  return handleResponse(res, 'Repo deep dive failed')
}

export async function shameCommitsApi(username, repo, tone = 'honest') {
  const repoParam = repo ? `&repo=${encodeURIComponent(repo)}` : '';
  const res = await fetch(`${BASE}/api/shame/commits/${encodeURIComponent(username)}?tone=${encodeURIComponent(tone)}${repoParam}`)
  return handleResponse(res, 'Commit shame failed')
}

export async function rateReadmeApi(username, tone = 'honest') {
  const res = await fetch(`${BASE}/api/shame/readme/${encodeURIComponent(username)}?tone=${encodeURIComponent(tone)}`)
  return handleResponse(res, 'README rater failed')
}

export async function roastStackApi(username, tone = 'honest') {
  const res = await fetch(`${BASE}/api/shame/stack/${encodeURIComponent(username)}?tone=${encodeURIComponent(tone)}`)
  return handleResponse(res, 'Stack roast failed')
}
