import { useState } from 'react'
import { IconMagnifier } from './Icons'

export default function ScanForm({ onScan, loading }) {
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState('honest')

  const submit = (e) => {
    e.preventDefault()
    if (username.trim()) onScan(username.trim(), mode)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-300 font-bold text-lg pointer-events-none">
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your-github-username"
            className="input-egg w-full"
            disabled={loading}
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="btn-primary whitespace-nowrap flex items-center gap-2 justify-center"
        >
          <IconMagnifier size={20} />
          {loading ? 'Cracking…' : 'Scan me'}
        </button>
      </div>
      <div className="flex justify-center items-center gap-3 mt-2">
        <label htmlFor="mode-select" className="text-brown-600 font-medium text-sm">
          AI Tone:
        </label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={loading}
          className="bg-white/50 border border-brown-300 text-brown-700 text-sm rounded-lg focus:ring-brown-500 focus:border-brown-500 block p-2 outline-none cursor-pointer"
        >
          <option value="honest">Honest Recruiter (Default)</option>
          <option value="professional">Professional & Polite</option>
          <option value="roast">Brutal Roast</option>
          <option value="hype">Startup Hype</option>
          <option value="pirate">Salty Pirate</option>
        </select>
      </div>
    </form>
  )
}