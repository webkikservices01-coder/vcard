import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { applyTheme, getTheme } from './lib/theme';

// Before the first paint, so the page never flashes in the wrong theme.
applyTheme(getTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
