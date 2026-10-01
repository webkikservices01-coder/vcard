import { useEffect, useState } from 'react';

// Dark (like aicardly.com) or light, remembered on this device. index.css holds the colours.
const KEY = 'aicardly_admin_theme';

export const getTheme = () => {
  try {
    return localStorage.getItem(KEY) || 'dark';
  } catch {
    return 'dark';
  }
};

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage blocked: theme just isn't remembered */
  }
};

export function useTheme() {
  const [theme, setTheme] = useState(getTheme);
  useEffect(() => applyTheme(theme), [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
