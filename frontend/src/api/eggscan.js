const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function scanGithub(username, mode = 'honest') {
  const res = await fetch(`${BASE}/api/scan/${encodeURIComponent(username)}?mode=${encodeURIComponent(mode)}`)
  if (!res.ok) {
    const err = await res.json().catch((e) => {
      console.error('Failed to parse error response:', e)
      return {}
    })
    throw new Error(err.error || 'Scan failed')
  }
  return res.json()
}

export async function battleGithub(u1, u2) {
  const res = await fetch(`${BASE}/api/battle?u1=${encodeURIComponent(u1)}&u2=${encodeURIComponent(u2)}`)
  if (!res.ok) {
    const err = await res.json().catch((e) => {
      console.error('Failed to parse error response:', e)
      return {}
    })
    throw new Error(err.error || 'Battle failed')
  }
  return res.json()
}

export async function getLeaderboard() {
  const res = await fetch(`${BASE}/api/leaderboard`)
  if (!res.ok) {
    const err = await res.json().catch((e) => {
      console.error('Failed to parse error response:', e)
      return {}
    })
    throw new Error(err.error || 'Failed to fetch leaderboard')
  }
  return res.json()
}

export async function getScanResult(id) {
  const res = await fetch(`${BASE}/api/scan/result/${encodeURIComponent(id)}`)
  if (!res.ok) {
    const err = await res.json().catch((e) => {
      console.error('Failed to parse error response:', e)
      return {}
    })
    throw new Error(err.error || 'Scan failed')
  }
  return res.json()
}
export async function deepDiveRepo(username, repoName, defaultBranch = 'main') {
  const res = await fetch(`${BASE}/api/scan/${encodeURIComponent(username)}/repo/${encodeURIComponent(repoName)}?defaultBranch=${encodeURIComponent(defaultBranch)}`)
  if (!res.ok) {
    const err = await res.json().catch((e) => {
      console.error('Failed to parse error response:', e)
      return {}
    })
    throw new Error(err.error || 'Repo deep dive failed')
  }
  return res.json()
}
