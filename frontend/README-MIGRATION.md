# EggScan Cloudflare migration overlay

This package replaces the Render/Spring Boot/Supabase backend with a TypeScript Cloudflare Worker and D1 while keeping the existing React UI.

## Apply to the repository

Copy the contents of this package into `frontend/`:

- replace `frontend/package.json`
- replace `frontend/vite.config.js`
- replace `frontend/src/api/eggscan.js`
- add `frontend/wrangler.jsonc`
- add `frontend/worker/`
- add `frontend/migrations/`

Keep `backend/` during the cutover as a rollback path. Do not delete it yet.

## Provision Cloudflare

From `frontend/`:

```bash
npm install
npx wrangler login
npx wrangler d1 create eggscan
```

Copy the returned database ID into `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`.

Add secrets:

```bash
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put CEREBRAS_API_KEY
npx wrangler secret put NVIDIA_API_KEY
npx wrangler secret put OPENROUTER_API_KEY
```

Configure AI Providers and Fallback Chain:
1. **Groq** (Primary, `GROQ_MODEL`: `openai/gpt-oss-120b`, configured via `GROQ_API_KEY`)
2. **Google Gemini** (`GEMINI_MODEL`: `gemini-2.5-flash`, configured via `GEMINI_API_KEY`)
3. **Cerebras** (`CEREBRAS_MODEL`: `llama3.1-8b`, configured via `CEREBRAS_API_KEY`)
4. **NVIDIA NIM** (`NVIDIA_MODEL`: `meta/llama-3.1-8b-instruct`, configured via `NVIDIA_API_KEY`)
5. **OpenRouter Free Router** (`OPENROUTER_MODEL`: `openrouter/free`, configured via `OPENROUTER_API_KEY`)
6. **Cloudflare Workers AI** (`WORKERS_AI_MODEL`: `@cf/meta/llama-3.1-8b-instruct-fp8`, via `"ai": { "binding": "AI" }`)

*Privacy Notice*: Repository evidence (sanitized metadata, commit messages, and readmes) may be transmitted to each fallback provider in the configured chain when upstream providers fail or rate limit. Never log or store raw secrets or client tokens.

- Regenerate binding types: `npm run cf-typegen`


Apply the database migration:

```bash
npm run db:migrate:remote
```

Develop locally:

```bash
npm run db:migrate:local
npm run dev
```

Deploy:

```bash
npm run deploy
```

## Verification gate

Before directing traffic away from Vercel/Render:

1. `GET /api/health` returns HTTP 200.
2. Scan a known GitHub username twice; the second honest scan should return the same cached ID within 24 hours.
3. Open `/?id=<id>` directly and refresh it.
4. Test leaderboard uniqueness and ordering.
5. Test battle, deep dive, commit review, README review, and stack review.
6. Inspect Worker logs for upstream timeout or AI validation errors.
7. Keep the old deployment available until these checks pass.

## Supabase data migration

This overlay does not silently migrate old records. Export the Supabase `scan_records` table before shutdown. If old shared result URLs matter, transform the export to the D1 columns in `migrations/0001_scan_records.sql`, import it, compare row counts, and sample old IDs before cutover.

## Known follow-up work

- Add Cloudflare Rate Limiting or Turnstile before public promotion.
- Add Worker integration tests using Cloudflare's Vitest pool.
- Add scheduled retention cleanup for old scan records if desired.
- Replace generated dependency ranges with a lockfile after `npm install`.
