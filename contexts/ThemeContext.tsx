import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'soft-accent' | 'gentle-warm';

interface ThemeContextType {
  theme: Theme | null; // null during SSR
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // Quick dark/light toggle
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    // This effect runs only on the client side
    const savedTheme = localStorage.getItem('site_theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      // The data-theme attribute is already set by the script in _document.tsx
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = systemPrefersDark ? 'dark' : 'light';
      setThemeState(initialTheme);
      // The data-theme attribute is already set by the script in _document.tsx
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('site_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);
  
  const toggleTheme = useCallback(() => {
    const newTheme = (theme === 'dark' || theme === 'soft-accent' || theme === 'gentle-warm') ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);


  const value = { theme, setTheme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
