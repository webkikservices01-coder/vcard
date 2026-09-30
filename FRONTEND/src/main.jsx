import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

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
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
