import { existsSync, readdirSync, unlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function stripDevVars() {
  return {
    name: 'strip-dev-vars',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (fileName === '.dev.vars' || fileName.endsWith('/.dev.vars') || fileName.endsWith('\\.dev.vars')) {
          delete bundle[fileName]
        }
      }
    },
    closeBundle() {
      const distDir = resolve(process.cwd(), 'dist')
      if (!existsSync(distDir)) return

      const cleanDir = (dir) => {
        const entries = readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = join(dir, entry.name)
          if (entry.isDirectory()) {
            cleanDir(fullPath)
          } else if (entry.name === '.dev.vars') {
            unlinkSync(fullPath)
          }
        }
      }

      cleanDir(distDir)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'test' ? [] : [cloudflare()]),
    stripDevVars(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
}))