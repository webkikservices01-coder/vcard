import { readFileSync } from 'node:fs'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), homeSchema()],
})
