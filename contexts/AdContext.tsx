import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Ad, SiteSettings } from '../types';

// --- AD CONTEXT ---

interface AdContextType {
  ads: Ad[];
  isLoading: boolean;
}

const AdContext = createContext<AdContextType>({
  ads: [],
  isLoading: true,
});

export const useAds = () => useContext(AdContext);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const data = await res.json();
          setAds(data);
        }
      } catch (error) {
        console.error('Failed to fetch ads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, []);

  return (
    <AdContext.Provider value={{ ads, isLoading }}>
      {children}
    </AdContext.Provider>
  );
};

// --- THEME CONTEXT ---

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // On component mount, sync state with the class set by the script in _document.tsx
    const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return newTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- SETTINGS CONTEXT ---

const FAVICON_DATA_URI = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Cdefs%3E%3ClinearGradient%20id='g2-grad'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0%25'%20stop-color='%23a855f7'/%3E%3Cstop%20offset='100%25'%20stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle%20cx='16'%20cy='16'%20r='15'%20fill='url(%23g2-grad)'/%3E%3Ctext%20x='16'%20y='22'%20font-family='Impact,%20sans-serif'%20font-size='18'%20fill='white'%20text-anchor='middle'%3EG2%3C/text%3E%3C/svg%3E";

const defaultSettings: SiteSettings = {
  site_name: 'G2gaming',
  site_icon_url: FAVICON_DATA_URI,
  ogads_script_src: '',
  hero_title: 'Welcome to<br />G2gaming',
  hero_subtitle: 'Your ultimate gaming destination.',
  hero_button_text: 'Explore Games',
  hero_button_url: '/games',
  hero_bg_url: 'https://picsum.photos/seed/banner/1200/400',
  promo_enabled: true,
  promo_text: 'Climb the new G2gaming leaderboards',
  promo_button_text: 'Explore games',
  promo_button_url: '/games',
  recaptcha_site_key: '6Lcm1QUsAAAAAP4bS9QiKH9jCpDXQ3ktJsgQwcO4', // Default test key
};

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
  value: SettingsContextType;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children, value }) => {
  return (
    <SettingsContext.Provider value={value || { settings: defaultSettings, isLoading: true }}>
      {children}
    </SettingsContext.Provider>
  );
};