// Runs after `vite build`: renders the homepage to HTML (src/entry-server.jsx) and puts it inside
// <div id="root"> in dist/index.html, so phones see the hero without waiting for the JavaScript.
// The block sits between <!-- home:start --> and <!-- home:end -->; og.php swaps it for an empty
// root on every other page, and an inline script empties it for visitors who chose the dark theme
// (the prerender is the default light theme).
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'
import Beasties from 'beasties'

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
  "<script>(function(){var t;try{t=localStorage.getItem('aicardly-theme-choice')}catch(e){}" +
  "if(location.pathname!=='/'||t==='dark'){document.getElementById('root').innerHTML=''}})()</script>"
let page = index.replace(EMPTY, () => `<!-- home:start --><div id="root">${html}</div>${keepOrClear}<!-- home:end -->`)

// Critical CSS: the rules the homepage uses go inline in <head>, and the full stylesheet loads
// without holding up the first paint (it used to block it: one more round trip on a phone).
// Other pages get an empty root, and src/main.jsx waits for the full stylesheet before drawing
// them, so they never show unstyled.
const beasties = new Beasties({
  path: fileURLToPath(new URL('../dist', import.meta.url)),
  publicPath: '/',
  preload: 'media',
  noscriptFallback: true,
  pruneSource: false,
  reduceInlineStyles: false,
  mergeStylesheets: true,
  keyframes: 'critical',
  inlineFonts: false,
  preloadFonts: false,
  logLevel: 'warn',
})
const before = page.length
page = await beasties.process(page)
const appCss = /<link rel="stylesheet" (?:crossorigin )?href="(\/assets\/index-[^"]+\.css)"[^>]*media="print"[^>]*>/
if (!appCss.test(page)) throw new Error('prerender: critical CSS step did not defer the app stylesheet')
// The site's own fonts (@font-face, preloaded in <head>) go inline too, so the first paint
// already uses them (no font swap that moves the text afterwards).
const cssFile = page.match(appCss)[1]
const fontFaces = (readFileSync(fileURLToPath(new URL(`../dist${cssFile}`, import.meta.url)), 'utf8').match(/@font-face\{[^}]*\}/g) || []).join('')
if (!fontFaces.includes('Inter')) throw new Error('prerender: @font-face rules not found in the app stylesheet')
page = page.replace('<style>', () => `<style>${fontFaces}`)
page = page.replace(appCss, (tag) => tag.replace('<link ', '<link data-app-css '))
writeFileSync(indexPath, page)
rmSync(outDir, { recursive: true, force: true })
console.log(`prerender: homepage ${Math.round(html.length / 1024)} KB of HTML added to dist/index.html; critical CSS ${Math.round((page.length - before) / 1024)} KB inline`)
