// Builds the card server renderer (src/entry-card-server.jsx) into BACKEND/ssr/card.mjs, one
// self-contained file (React and the designs included) the backend imports. Run after a frontend
// change that touches the card designs, then deploy the backend: npm run build:card-ssr
import { rmSync, renameSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = fileURLToPath(new URL('../../BACKEND/ssr', import.meta.url))
rmSync(outDir, { recursive: true, force: true })
await build({
  root,
  logLevel: 'warn',
  mode: 'production',
  ssr: { noExternal: true },
  // The card code's browser globals point at src/ssr-env.js's stand-ins, never the server's own.
  define: {
    // React's production build (fast, no dev warnings); Node doesn't set NODE_ENV by itself.
    'process.env.NODE_ENV': '"production"',
    window: 'globalThis.__wcWin',
    document: 'globalThis.__wcDoc',
    navigator: 'globalThis.__wcNav',
    localStorage: 'globalThis.__wcWin.localStorage',
    sessionStorage: 'globalThis.__wcWin.sessionStorage',
    location: 'globalThis.__wcWin.location',
    Image: 'globalThis.__wcImage',
    matchMedia: 'globalThis.__wcWin.matchMedia',
    requestAnimationFrame: 'globalThis.__wcWin.requestAnimationFrame',
    requestIdleCallback: 'globalThis.__wcWin.requestIdleCallback',
  },
  build: {
    ssr: 'src/entry-card-server.jsx',
    outDir,
    emptyOutDir: true,
    copyPublicDir: false,
    rolldownOptions: { output: { codeSplitting: false, entryFileNames: 'card.mjs', format: 'esm' } },
  },
})
if (!existsSync(`${outDir}/card.mjs`)) throw new Error(`card SSR: card.mjs not built (${readdirSync(outDir).join(', ')})`)
const { renderCard } = await import(`${new URL('../../BACKEND/ssr/card.mjs', import.meta.url).href}?t=${Date.now()}`)
const html = await renderCard({ card: { _id: 'x', username: 'test', theme: 'webkik-signature', personalInfo: { name: 'Test Person' }, dynamicLinks: [] } }, null)
if (!html.includes('Test Person')) throw new Error('card SSR: test render failed')
console.log(`card SSR: BACKEND/ssr/card.mjs built, test render ${Math.round(html.length / 1024)} KB`)
