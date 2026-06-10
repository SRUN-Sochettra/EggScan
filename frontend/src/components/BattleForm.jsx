import { useState } from 'react'

export default function BattleForm({ onBattle, loading }) {
  const [u1, setU1] = useState('')
  const [u2, setU2] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (u1.trim() && u2.trim()) onBattle(u1.trim(), u2.trim())
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 card p-5 bg-[#FCE9B8]/50">
      <h3 className="font-display font-bold text-lg text-brown-700 text-center mb-2">🥊 1v1 Battle Mode</h3>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-300 font-bold text-lg pointer-events-none">@</span>
          <input type="text" value={u1} onChange={(e) => setU1(e.target.value)} placeholder="Player 1" aria-label="Player 1 GitHub username" className="input-egg w-full" disabled={loading} />
        </div>
        <span className="font-display font-black text-brown-500 italic">VS</span>
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-300 font-bold text-lg pointer-events-none">@</span>
          <input type="text" value={u2} onChange={(e) => setU2(e.target.value)} placeholder="Player 2" aria-label="Player 2 GitHub username" className="input-egg w-full" disabled={loading} />
        </div>
      </div>
      <button type="submit" disabled={loading || !u1.trim() || !u2.trim()} title={(!u1.trim() || !u2.trim()) ? "Please enter both usernames to start a battle" : "Start Battle"} className="btn-primary mt-2">
        {loading ? 'Simulating battle...' : 'FIGHT!'}
      </button>
    </form>
  )
}
