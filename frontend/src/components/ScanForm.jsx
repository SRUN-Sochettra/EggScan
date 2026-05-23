import { useState } from 'react'
import { IconMagnifier } from './Icons'

export default function ScanForm({ onScan, loading }) {
  const [username, setUsername] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (username.trim()) onScan(username.trim())
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
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
    </form>
  )
}