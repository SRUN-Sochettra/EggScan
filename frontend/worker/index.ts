declare const __EGGSCAN_BUILD_MARKER__: string

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppBindings } from './types'
import { errorResponse } from './lib/errors'
import { BranchSchema, IdSchema, RepoSchema, ToneSchema, UsernameSchema } from './lib/schemas'
import { battle, deepDive, rateReadmes, roastStack, scan, shameCommits } from './lib/analyze'
import { getScanById, leaderboard } from './lib/db'

const app = new Hono<AppBindings>()
app.use('/api/*', cors({ origin: (origin) => origin, allowMethods: ['GET'], credentials: false }))
app.get('/', () => new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Cellipse cx=%2232%22 cy=%2235%22 rx=%2222%22 ry=%2227%22 fill=%22%23FCE9B8%22 stroke=%22%232E2416%22 stroke-width=%224%22/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800;9..144,900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>EggScan — Your GitHub, rated in eggs</title>
    <meta name="description" content="Your GitHub, through a recruiter's eyes. Rated in eggs." />
    <meta name="eggscan-build" content="${__EGGSCAN_BUILD_MARKER__}" />
    <script type="module" crossorigin src="/assets/index-5hKMBgaA.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BNxE2a6p.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`, {
  headers: { 'content-type': 'text/html; charset=UTF-8', 'cache-control': 'no-store' },
}))
app.onError((error, c) => errorResponse(c, error))

const parse = <T>(schema: { parse(value: unknown): T }, value: unknown) => schema.parse(value)
const tone = (value: string | undefined) => parse(ToneSchema, value ?? 'honest')

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'eggscan-worker' }))
app.get('/api/scan/:username', async (c) => c.json(await scan(c.env, parse(UsernameSchema, c.req.param('username')), tone(c.req.query('mode')))))
app.get('/api/scan/result/:id', async (c) => c.json(await getScanById(c.env, parse(IdSchema, c.req.param('id')))))
app.get('/api/leaderboard', async (c) => c.json(await leaderboard(c.env)))
app.get('/api/battle', async (c) => c.json(await battle(c.env, parse(UsernameSchema, c.req.query('u1')), parse(UsernameSchema, c.req.query('u2')))))
app.get('/api/scan/:username/repo/:repo', async (c) => c.json(await deepDive(c.env, parse(UsernameSchema, c.req.param('username')), parse(RepoSchema, c.req.param('repo')), parse(BranchSchema, c.req.query('defaultBranch') ?? 'main'))))
app.get('/api/shame/commits/:username', async (c) => c.json(await shameCommits(c.env, parse(UsernameSchema, c.req.param('username')), c.req.query('repo') ? parse(RepoSchema, c.req.query('repo')) : undefined, tone(c.req.query('tone')))))
app.get('/api/shame/readme/:username', async (c) => c.json(await rateReadmes(c.env, parse(UsernameSchema, c.req.param('username')), tone(c.req.query('tone')))))
app.get('/api/shame/stack/:username', async (c) => c.json(await roastStack(c.env, parse(UsernameSchema, c.req.param('username')), tone(c.req.query('tone')))))

export default app
