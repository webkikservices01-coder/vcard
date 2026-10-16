import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Homepage structured data: builds the JSON-LD <script> tags from src/data/homeSchema.json
// (the same FAQ list the homepage shows) into index.html, between the schema:home markers.
// public/og.php removes that block on every page except the homepage.
function homeSchema() {
  return {
    name: 'aicardly-home-schema',
    transformIndexHtml(html) {
      const data = JSON.parse(readFileSync(new URL('./src/data/homeSchema.json', import.meta.url), 'utf8'))
      const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`
      const tags = [
        ld({ '@context': 'https://schema.org', '@graph': data.graph }),
        ld({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }),
        ld({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aicardly.com/' }],
        }),
      ]
      return html.replace('<!-- schema:home -->', `<!-- schema:home:start -->\n    ${tags.join('\n    ')}\n    <!-- schema:home:end -->`)
    },
  }
}

// Pages are lazy chunks, so normally the browser only asks for one after the main bundle has run.
// This starts downloading the page's chunks together with the main bundle: the homepage on "/",
// and the card renderer on card links (index.html's inline script marks those with
// window.__cardPrefetch). That brings the first paint forward on phones.
function preloadPageChunks() {
  return {
    name: 'aicardly-preload-pages',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html
        const chunks = Object.values(ctx.bundle).filter((c) => c.type === 'chunk')
        const entry = chunks.find((c) => c.isEntry)
        const skip = new Set([entry?.fileName, ...(entry?.imports || [])])
        // A page chunk and everything it imports (minus what the main bundle already loads).
        const filesFor = (re) => {
          const page = chunks.find((c) => c.facadeModuleId && re.test(c.facadeModuleId))
          if (!page) return []
          const files = []
          const walk = (name) => {
            if (skip.has(name) || files.includes(name)) return
            files.push(name)
            ;(ctx.bundle[name]?.imports || []).forEach(walk)
          }
          walk(page.fileName)
          return files.map((f) => '/' + f)
        }
        const home = filesFor(/src[\/]pages[\/]LandingPage\.jsx$/)
        const card = filesFor(/src[\/]pages[\/]PublicVcard\.jsx$/)
        // The app bundle itself is started by this script (Vite's own <script type="module"> and
        // its modulepreload links are taken out below). On the homepage, which arrives already
        // drawn (scripts/prerender.mjs), it starts right after the first paint: the ~150 KB of
        // JavaScript only makes the page interactive, so on a phone connection the fonts and
        // images go first and the page shows sooner. Every other page starts it at once.
        const entryDeps = (entry?.imports || []).map((f) => '/' + f)
        // Card designs are separate files (src/webcard/WebCard.jsx). Which file each design is in,
        // so index.html's card prefetch can start it as soon as it knows the card's design.
        const cardFiles = new Set(card.map((f) => f.slice(1)))
        const designFile = (re) => {
          const c = chunks.find((x) => x.facadeModuleId && re.test(x.facadeModuleId))
          return c ? ['/' + c.fileName, ...c.imports.filter((i) => !cardFiles.has(i) && !skip.has(i)).map((i) => '/' + i)] : []
        }
        const D = {
          t01: designFile(/templates[\/]Templates01to03\.jsx$/),
          t04: designFile(/templates[\/]Templates04to06\.jsx$/),
          reel: designFile(/templates[\/]CreatorReel\.jsx$/),
          dev: designFile(/templates[\/]DevTerminal\.jsx$/),
          editorial: designFile(/templates[\/]EditorialArchitect\.jsx$/),
          signature: designFile(/templates[\/]WebkikSignature\.jsx$/),
        }
        if (Object.values(D).some((v) => !v.length)) throw new Error('aicardly-preload-pages: a card design chunk was not found')
        const tplChunks = {
          'aurora-ai': D.t01, 'minimal-pro': D.t01, 'neo-brutal': D.t01,
          'luxe-noir': D.t04, 'split-hero-corporate': D.t04, 'soft-bento-wellness': D.t04,
          'creator-reel': D.reel, 'dev-terminal': D.dev, 'editorial-architect': D.editorial, 'webkik-signature': D.signature,
        }
        // The card stylesheet, for public/og.php: it links it when it puts a server-drawn card on the page.
        const cardChunk = chunks.find((c) => c.facadeModuleId && /webcard[\/]WebCard\.jsx$/.test(c.facadeModuleId))
        const cardCss = [...(cardChunk?.viteMetadata?.importedCss || [])][0]
        if (!cardCss) throw new Error('aicardly-preload-pages: the card stylesheet was not found')
        const script =
          `<!-- card-css:/${cardCss} -->` +
          `<script>window.__tplChunks=${JSON.stringify(tplChunks)};</script>` +
          // (Dark-theme visitors get an empty page instead of the pre-drawn light one: load at once.)
          `<script>(function(){var dark;try{dark=localStorage.getItem('aicardly-theme-choice')==='dark'}catch(e){}` +
          `var home=location.pathname==='/'&&!dark&&!!document.querySelector('link[data-app-css]');` +
          `var f=${JSON.stringify(entryDeps)}.concat(location.pathname==='/'?${JSON.stringify(home)}:window.__cardPrefetch?${JSON.stringify(card)}:[]);` +
          `function pre(h){var l=document.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=h;document.head.appendChild(l);}` +
          `function run(){f.forEach(pre);var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src=${JSON.stringify('/' + entry.fileName)};document.head.appendChild(s);}` +
          `if(!home){run();return;}` +
          // After the first paint, and only once the whole page has been parsed (React takes over all of it).
          `var done=0;function go(){if(done)return;done=1;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();}` +
          `try{var po=new PerformanceObserver(function(l){if(l.getEntriesByName('first-contentful-paint').length){po.disconnect();setTimeout(go,0);}});po.observe({type:'paint',buffered:true});}catch(e){go();}` +
          `setTimeout(go,2000);})();</script>`
        html = html
          .replace(/\s*<script type="module" crossorigin src="[^"]+"><\/script>/, '')
          .replace(/\s*<link rel="modulepreload" crossorigin href="[^"]+">/g, '')
        // The two self-hosted latin font files (src/index.css) start downloading with the HTML
        // instead of after the CSS has been parsed.
        const fonts = Object.values(ctx.bundle)
          .filter((a) => a.type === 'asset' && /(inter|plus-jakarta-sans)-latin-wght-normal/.test((a.names || [a.name]).join(' ')))
          .map((a) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/${a.fileName}" />`)
        return html.replace('</head>', `    ${[...fonts, script].join('\n    ')}\n  </head>`)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), homeSchema(), preloadPageChunks()],
  // react-router's package points bundlers at its development build by default (~95 KB bigger,
  // with dev-only checks); production builds use its production files instead.
  resolve: {
    alias:
      command === 'build'
        ? [
            { find: /^react-router$/, replacement: fileURLToPath(new URL('./node_modules/react-router/dist/production/index.mjs', import.meta.url)) },
            { find: /^react-router\/dom$/, replacement: fileURLToPath(new URL('./node_modules/react-router/dist/production/dom-export.mjs', import.meta.url)) },
          ]
        : [],
  },
  build: {
    rolldownOptions: {
      output: {
        // Without these groups every icon became its own tiny file, so a page needed ~50 requests;
        // on a phone each one costs a round trip before the page can show.
        codeSplitting: {
          // includeDependenciesRecursively: false keeps React itself out of these groups (it was
          // pulled into the motion chunk, so every page, the homepage too, loaded framer-motion).
          groups: [
            { name: 'icons', test: /node_modules[\\/](lucide-react|react-icons)[\\/]/, includeDependenciesRecursively: false },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, includeDependenciesRecursively: false },
          ],
        },
      },
    },
  },
}))
