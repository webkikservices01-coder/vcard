import { StrictMode, startTransition } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { installSessionGuard } from './utils/session.js'

installSessionGuard()

const app = (
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
const root = document.getElementById('root')
// The homepage arrives already rendered (scripts/prerender.mjs), so React takes over that markup
// instead of drawing it again; every other page starts empty.
// The full stylesheet loads without blocking the homepage's first paint (the homepage's own rules
// are inline, scripts/prerender.mjs). Other pages start empty, so they wait for it (it has
// usually arrived by now) and never show unstyled.
const appCss = () => {
  const link = document.querySelector('link[data-app-css]')
  if (!link || link.media !== 'print') return Promise.resolve()
  return new Promise((resolve) => {
    link.addEventListener('load', resolve, { once: true })
    link.addEventListener('error', resolve, { once: true })
    setTimeout(resolve, 5000)
  })
}
// Taking over the pre-drawn homepage runs as a transition: React does it in small slices and lets the
// browser respond in between, instead of one long block (the page is already on screen meanwhile).
if (root.firstElementChild) startTransition(() => hydrateRoot(root, app))
else appCss().then(() => createRoot(root).render(app))
