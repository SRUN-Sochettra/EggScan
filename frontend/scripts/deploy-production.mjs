import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(frontendDirectory)

const configPath = resolve(frontendDirectory, 'wrangler.jsonc')
const builtHtmlPath = resolve(frontendDirectory, 'dist/client/index.html')
const markerPattern = /<meta\s+name=["']eggscan-build["']\s+content=["']([^"']+)["'][^>]*>/i
const modulePattern = /<script\s+[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/i
const productionUrl = 'https://eggscan.0xlab.workers.dev/'
const firefoxHeaders = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
}

const npmCommand = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm'
const quoteWindowsArg = (arg) => /[\s"]/.test(String(arg)) ? `"${String(arg).replaceAll('"', '\\"')}"` : String(arg)
const npmArgs = (args) => process.platform === 'win32'
  ? ['/d', '/s', '/c', ['npm', ...args].map(quoteWindowsArg).join(' ')]
  : args
const runNpm = (args) => execFileSync(npmCommand, npmArgs(args), { cwd: frontendDirectory, stdio: 'inherit', encoding: 'utf8' })
const captureNpm = (args) => execFileSync(npmCommand, npmArgs(args), { cwd: frontendDirectory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
const hash = (body) => createHash('sha256').update(body).digest('hex')
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms))

runNpm(['run', 'build'])

if (!existsSync(builtHtmlPath)) throw new Error(`Missing production HTML: ${builtHtmlPath}`)
const builtHtml = readFileSync(builtHtmlPath, 'utf8')
const generatedConfigPath = resolve(frontendDirectory, 'dist/eggscan/wrangler.json')
if (!existsSync(generatedConfigPath)) throw new Error(`Canonical deploy failed: missing generated Wrangler config ${generatedConfigPath}.`)
const generatedConfig = JSON.parse(readFileSync(generatedConfigPath, 'utf8'))
const effectiveAssetDirectory = resolve(dirname(generatedConfigPath), generatedConfig.assets?.directory ?? '')
if (effectiveAssetDirectory !== resolve(frontendDirectory, 'dist/client')) {
  throw new Error(`Canonical deploy failed: effective assets.directory resolves to ${effectiveAssetDirectory}, expected ${resolve(frontendDirectory, 'dist/client')}.`)
}
const builtMarker = builtHtml.match(markerPattern)?.[1]
const modulePath = builtHtml.match(modulePattern)?.[1]
if (!builtMarker) throw new Error('Canonical deploy failed: built HTML has no eggscan-build marker.')
if (!modulePath?.startsWith('/assets/') || !modulePath.endsWith('.js')) throw new Error('Canonical deploy failed: built HTML has no compiled /assets/*.js module.')
if (builtHtml.includes('/src/main.jsx') || /(?:src|href)=["'][^"']+\.jsx(?:["']|\?)/i.test(builtHtml)) throw new Error('Canonical deploy failed: source JSX reference remains in built HTML.')

const dryRunOutput = captureNpm(['exec', '--', 'wrangler', 'deploy', '--config', configPath, '--dry-run', '--outdir', 'dist/deploy-dry-run'])
if (!/Read \d+ files from the assets directory .*dist[\\/]client/i.test(dryRunOutput)) {
  throw new Error(`Canonical deploy failed: Wrangler dry run did not resolve dist/client. Output:\n${dryRunOutput}`)
}
runNpm(['exec', '--', 'wrangler', 'deploy', '--config', configPath])

const deadline = Date.now() + 120_000
let lastMismatch = ''
while (Date.now() < deadline) {
  const response = await fetch(productionUrl, { headers: firefoxHeaders })
  const body = await response.text()
  const actualMarker = body.match(markerPattern)?.[1] ?? ''
  const actualModule = body.match(modulePattern)?.[1] ?? ''
  const evidence = `status=${response.status} sha256=${hash(body)} marker=${actualMarker || '<missing>'} script=${actualModule || '<missing>'} cf-ray=${response.headers.get('cf-ray') || '<missing>'} cache=${response.headers.get('cf-cache-status') || '<missing>'}`
  console.log(`production smoke: ${evidence}`)
  if (response.ok && actualMarker === builtMarker && actualModule === modulePath && !body.includes('/src/main.jsx')) {
    const moduleResponse = await fetch(new URL(modulePath, productionUrl), { headers: firefoxHeaders })
    const moduleType = moduleResponse.headers.get('content-type') || ''
    if (!moduleResponse.ok || !/^application\/javascript|^text\/javascript/i.test(moduleType)) {
      throw new Error(`Compiled module check failed: status=${moduleResponse.status} content-type=${moduleType}`)
    }
    console.log(`Canonical production deploy passed: marker=${builtMarker} script=${modulePath} module-content-type=${moduleType}`)
    process.exit(0)
  }
  lastMismatch = evidence
  await sleep(10_000)
}
throw new Error(`Canonical production deploy timed out after 120s. Last mismatch: ${lastMismatch}`)
