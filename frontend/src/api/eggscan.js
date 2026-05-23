const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function scanGithub(username) {
  const res = await fetch(`${BASE}/api/scan/${encodeURIComponent(username)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Scan failed')
  }
  return res.json()
}