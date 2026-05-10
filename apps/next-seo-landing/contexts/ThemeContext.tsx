'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }): any {
  // Read the value the blocking script already set on <html> so React state
  // matches the DOM from the very first render — no flash, no mismatch.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return attr;
    }
    return 'dark';
  });

  // Keep <html data-theme> and localStorage in sync whenever theme changes.
  // Also add `theme-ready` to body on first mount so CSS transitions kick in
  // only after the initial paint — prevents background color flash.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add('theme-ready');
    try {
      localStorage.setItem('theme', theme);
    } catch (_) { }
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, toggleTheme } },
    children,
  ) as any;
}

export function useTheme() {
  return useContext(ThemeContext);
}
