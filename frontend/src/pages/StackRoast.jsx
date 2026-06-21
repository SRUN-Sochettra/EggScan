import { useState } from 'react';
import { roastStackApi } from '../api/eggscan';
import Loader from '../components/Loader';
import { IconMagnifier, IconBrokenEgg } from '../components/Icons';

export default function StackRoast() {
  const [username, setUsername] = useState('');
  const [tone, setTone] = useState('honest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await roastStackApi(username.trim(), tone);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <header className="text-center mb-10">
        <h1 className="font-display font-black text-4xl sm:text-5xl text-brown-700 tracking-tight">
          StackRoast
        </h1>
        <p className="text-brown-500 mt-3 text-lg font-medium">
          Let AI judge your life choices based on the frameworks and languages you use.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#FFFDF7] p-6 rounded-2xl border-2 border-brown-700 shadow-[0_6px_0_-1px_#2E2416]">
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-brown-700 font-bold text-sm">GitHub Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-300 font-bold text-lg pointer-events-none">
              @
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
              maxLength={39}
              placeholder="torvalds"
              className="input-egg w-full"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="tone" className="text-brown-700 font-bold text-sm">Roaster Persona</label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={loading}
            className="bg-[#FFFDF7] border-2 border-brown-700 text-brown-700 font-medium rounded-xl focus:ring-brown-500 focus:border-brown-500 block p-3 outline-none cursor-pointer shadow-[0_4px_0_-1px_#2E2416]"
          >
            <option value="honest">Honest Reviewer</option>
            <option value="gordon">Gordon Ramsay</option>
            <option value="parent">Disappointed Parent</option>
            <option value="techbro">Silicon Valley Tech Bro</option>
            <option value="pirate">Salty Pirate</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="btn-primary flex items-center justify-center gap-2 mt-2"
        >
          <IconMagnifier size={20} />
          {loading ? 'Analyzing...' : 'Roast My Stack'}
        </button>
      </form>

      {loading && <div className="mt-12"><Loader /></div>}

      {error && (
        <div className="card mt-8 p-6 text-center" style={{ background: '#F8D5C8' }}>
          <div className="flex justify-center mb-2">
            <IconBrokenEgg size={56} />
          </div>
          <p className="text-brown-700 font-semibold">Oops — {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-10 space-y-6 animate-[pop_0.4s_ease-out]">

          <div className="card p-6 bg-[#FFFDF7] border-l-8 border-l-[#F5B544]">
            <h2 className="font-display font-bold text-2xl text-brown-700 mb-2">Overall Verdict</h2>
            <p className="text-brown-600 text-lg font-medium">{result.overallVerdict}</p>
          </div>

          <div className="card p-6 bg-[#FFFDF7]">
            <h2 className="font-display font-bold text-xl text-brown-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌐</span> Top Languages Roast
            </h2>
            <p className="text-brown-600 leading-relaxed">{result.topLanguagesRoast}</p>
          </div>

          <div className="card p-6 bg-[#FFFDF7]">
            <h2 className="font-display font-bold text-xl text-brown-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Config Deep-Dive Roast
            </h2>
            <p className="text-brown-600 leading-relaxed">{result.configDeepDiveRoast}</p>
          </div>

        </div>
      )}
    </div>
  );
}
