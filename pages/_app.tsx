import React, { useState, useEffect } from 'react';
import App from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import '../styles/globals.css';
import type { SocialLink, SiteSettings } from '@/types';
import { AdProvider, ThemeProvider, SettingsProvider } from '../contexts/AdContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const defaultSettings: SiteSettings = {
  site_name: 'G2gaming',
  site_icon_url: '/favicon.ico',
  ogads_script_src: '',
  hero_title: 'Welcome to G2gaming',
  hero_subtitle: 'Your ultimate gaming destination.',
  hero_button_text: 'Explore Games',
  hero_button_url: '/games',
  hero_bg_url: '',
  promo_enabled: false,
  promo_text: '',
  promo_button_text: '',
  promo_button_url: '',
  recaptcha_site_key: '',
};

type MyAppProps = {
  Component: React.ComponentType<any>;
  pageProps: any;
};

declare global {
    interface Window {
        __ogadsLoaded?: boolean;
    }
}

function MyApp({ Component, pageProps }: MyAppProps) {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(pageProps.settings || defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingSocials, setIsLoadingSocials] = useState(true);

  const isAdminPage = router.pathname.startsWith('/admin');

  // --- 1. Global OGAds Event Bridge ---
  useEffect(() => {
    if (isAdminPage) return;

    const handleLockerCompletion = () => {
      // Get current path to use as a unique key for the game
      const slugKey = window.location.pathname;
      
      // Persist unlock state per slug
      sessionStorage.setItem(`unlocked_${slugKey}`, "true");
      
      // FORCE RELOAD: Mandatory to clear OGAds overlay and refresh React state
      window.location.reload();
    };

    // Official OGAds DOM event listener
    window.addEventListener("ogads_unlocked", handleLockerCompletion);
    
    return () => {
      window.removeEventListener("ogads_unlocked", handleLockerCompletion);
    };
  }, [isAdminPage]);

  useEffect(() => {
    const fetchClientSideData = async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : '');
      setIsLoadingSettings(true);
      try {
        const settingsRes = await fetch(`${API_BASE}/api/settings`);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
      
      if (!isAdminPage) {
        try {
          const socialLinksRes = await fetch(`${API_BASE}/api/social-links`);
          if (socialLinksRes.ok) {
            const data = await socialLinksRes.json();
            if(Array.isArray(data)) setSocialLinks(data);
          }
        } catch (error) {
           console.error('Failed to fetch social links:', error);
        } finally {
          setIsLoadingSocials(false);
        }
      } else {
        setIsLoadingSocials(false);
      }
    };
    fetchClientSideData();
  }, [isAdminPage]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const searchablePages = ['/games', '/blog', '/shop'];
    if (query && !searchablePages.includes(router.pathname)) {
      router.push('/games');
    }
  };

  if (isAdminPage) {
    return <Component {...pageProps} />;
  }
  
  return (
    <ThemeProvider>
      <AdProvider>
        <SettingsProvider value={{ settings, isLoading: isLoadingSettings }}>
          <Head children={<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />} />
          <div className={`bg-[#0d0d0d] text-white min-h-screen flex ${inter.variable} font-sans overflow-x-hidden`}>
            {isMobileSidebarOpen && <div className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>}
            <Sidebar isExpanded={isSidebarExpanded} onMouseEnter={() => setIsSidebarExpanded(true)} onMouseLeave={() => setIsSidebarExpanded(false)} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out w-full max-w-full ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'}`}>
              <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} onSearchFocus={() => setSearchActive(true)} onSearchBlur={() => setSearchActive(false)} onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} socialLinks={socialLinks} isLoadingSocials={isLoadingSocials} />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full">
                <Component {...pageProps} searchQuery={searchQuery} searchActive={searchActive} />
              </main>
            </div>
          </div>
        </SettingsProvider>
      </AdProvider>
    </ThemeProvider>
  );
}

MyApp.getInitialProps = async (appContext: any) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default MyApp;