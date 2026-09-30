// Build-time only (scripts/prerender.mjs): renders the homepage to HTML so it shows before the
// app's JavaScript has loaded. The browser then hydrates this same markup (src/main.jsx).
import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import { AppRoutes } from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

export async function renderHome() {
  const errors = [];
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <ThemeProvider>
        <StaticRouter location="/">
          <AppRoutes />
        </StaticRouter>
      </ThemeProvider>
    </StrictMode>,
    {
      onError(err) {
        errors.push(err);
      },
    },
  );
  let html = '';
  for await (const chunk of prelude) html += chunk;
  // Any error means part of the page fell back to its loading state; don't ship that.
  if (errors.length) throw errors[0];
  return html;
}
