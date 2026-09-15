import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const frontendDirectory = resolve(scriptDirectory, '..')
const wranglerPath = resolve(frontendDirectory, 'wrangler.jsonc')
const wranglerSource = readFileSync(wranglerPath, 'utf8')
const assetDirectoryMatch = wranglerSource.match(/"assets"\s*:\s*\{[\s\S]*?"directory"\s*:\s*"([^"]+)"/)

if (!assetDirectoryMatch) {
  throw new Error('Production asset check failed: Wrangler assets.directory is missing.')
}

const assetDirectory = resolve(frontendDirectory, assetDirectoryMatch[1])
const htmlPath = resolve(assetDirectory, 'index.html')

if (!existsSync(htmlPath)) {
  throw new Error(`Production asset check failed: ${htmlPath} does not exist.`)
}

const html = readFileSync(htmlPath, 'utf8')

if (/\/src\/main\.jsx/i.test(html) || /(?:src|href)=["'][^"']*\.jsx(?:["']|\?)/i.test(html)) {
  throw new Error('Production asset check failed: dist/index.html references a JSX source module.')
}

const moduleAssetMatch = html.match(/<script\s+[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/i)
if (!moduleAssetMatch || !moduleAssetMatch[1].startsWith('/assets/') || extname(moduleAssetMatch[1]) !== '.js') {
  throw new Error('Production asset check failed: compiled /assets/*.js module is missing from dist/index.html.')
}

const moduleAssetPath = resolve(assetDirectory, moduleAssetMatch[1].replace(/^\//, ''))
if (!existsSync(moduleAssetPath)) {
  throw new Error(`Production asset check failed: referenced JavaScript asset ${moduleAssetPath} does not exist.`)
}

const moduleAsset = readFileSync(moduleAssetPath, 'utf8')
if (!moduleAsset.trim() || /\bfrom\s+['"][^'"]+\.(?:jsx|tsx)['"]/i.test(moduleAsset) || /(?:import|export)\s+[^;]*['"]\/src\//i.test(moduleAsset)) {
  throw new Error('Production asset check failed: referenced JavaScript asset is empty or contains source JSX imports.')
}

console.log(`Production asset check passed: ${htmlPath} references ${moduleAssetMatch[1]}.`)
