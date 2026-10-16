import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// The site always opens in the light (white) theme. Only a visitor who taps the theme button
// gets dark, and only that choice is remembered (THEME_KEY). The old 'app-theme' value was saved
// automatically for everyone, so it is ignored.
export const THEME_KEY = 'aicardly-theme-choice';
const readChoice = () => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const ThemeProvider = ({ children }) => {
  // 'light' when prerendering the homepage at build time (no browser there).
  const [theme, setTheme] = useState(() => (typeof window === 'undefined' ? 'light' : readChoice()));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme !== 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage blocked: the choice lasts for this visit */
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
