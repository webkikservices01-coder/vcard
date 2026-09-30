// Runs after `vite build`: renders the homepage to HTML (src/entry-server.jsx) and puts it inside
// <div id="root"> in dist/index.html, so phones see the hero without waiting for the JavaScript.
// The block sits between <!-- home:start --> and <!-- home:end -->; og.php swaps it for an empty
// root on every other page, and an inline script empties it for visitors who chose the light theme
// (the prerender is the default dark theme).
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = fileURLToPath(new URL('../node_modules/.prerender', import.meta.url))

await build({
  root,
  logLevel: 'warn',
  ssr: { noExternal: true },
  build: { ssr: 'src/entry-server.jsx', outDir, emptyOutDir: true, rolldownOptions: { output: { codeSplitting: false } } },
})
const { renderHome } = await import(pathToFileURL(`${outDir}/entry-server.js`).href)
const html = await renderHome()
if (!html.includes('<h1')) throw new Error('prerender: homepage HTML has no <h1>; not writing it')

const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url))
const index = readFileSync(indexPath, 'utf8')
const EMPTY = '<div id="root"></div>'
if (!index.includes(EMPTY)) throw new Error('prerender: <div id="root"></div> not found in dist/index.html')
const keepOrClear =
  "<script>(function(){var t;try{t=localStorage.getItem('app-theme')}catch(e){}" +
  "if(location.pathname!=='/'||t==='light'){document.getElementById('root').innerHTML=''}})()</script>"
writeFileSync(
  indexPath,
  index.replace(EMPTY, () => `<!-- home:start --><div id="root">${html}</div>${keepOrClear}<!-- home:end -->`),
)
rmSync(outDir, { recursive: true, force: true })
console.log(`prerender: homepage ${Math.round(html.length / 1024)} KB of HTML added to dist/index.html`)
