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
        const script =
          `<script>(function(){var f=location.pathname==='/'?${JSON.stringify(home)}:window.__cardPrefetch?${JSON.stringify(card)}:null;` +
          `if(f)f.forEach(function(h){var l=document.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=h;document.head.appendChild(l);});})();</script>`
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
          groups: [
            { name: 'icons', test: /node_modules[\\/](lucide-react|react-icons)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/ },
          ],
        },
      },
    },
  },
}))
