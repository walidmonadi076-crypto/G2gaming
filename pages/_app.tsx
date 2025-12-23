import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import '../styles/globals.css';
import type { SocialLink, SiteSettings } from '@/types';
import { AdProvider, ThemeProvider, SettingsProvider } from '../contexts/AdContext';

const defaultSettings: SiteSettings = {
  site_name: 'G2gaming',
  site_icon_url: '',
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

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(pageProps.settings || defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingSocials, setIsLoadingSocials] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const isAdminPage = router.pathname.startsWith('/admin');

  useEffect(() => {
    setIsMounted(true);
    
    const handleLockerCompletion = () => {
      sessionStorage.setItem(`unlocked_${window.location.pathname}`, "true");
      window.location.reload();
    };
    window.addEventListener("ogads_unlocked", handleLockerCompletion);
    return () => window.removeEventListener("ogads_unlocked", handleLockerCompletion);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const fetchData = async () => {
      try {
        const [sRes, slRes] = await Promise.all([
          fetch('/api/settings'),
          isAdminPage ? Promise.resolve(null) : fetch('/api/social-links')
        ]);
        if (sRes.ok) setSettings(await sRes.json());
        if (slRes && slRes.ok) setSocialLinks(await slRes.json());
      } catch (e) { console.error(e); }
      finally { setIsLoadingSettings(false); setIsLoadingSocials(false); }
    };
    fetchData();
  }, [isAdminPage, isMounted]);

  if (isAdminPage) return <Component {...pageProps} />;

  return (
    <ThemeProvider>
      <AdProvider>
        <SettingsProvider value={{ settings, isLoading: isLoadingSettings }}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
          </Head>
          <div className={`bg-[#0d0d0d] text-white min-h-screen flex font-sans`} suppressHydrationWarning={true}>
            {isMobileSidebarOpen && <div className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>}
            <Sidebar isExpanded={isSidebarExpanded} onMouseEnter={() => setIsSidebarExpanded(true)} onMouseLeave={() => setIsSidebarExpanded(false)} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
            <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'}`} suppressHydrationWarning={true}>
              <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchFocus={() => setSearchActive(true)} onSearchBlur={() => setSearchActive(false)} onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} socialLinks={socialLinks} isLoadingSocials={isLoadingSocials} />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Component {...pageProps} searchQuery={searchQuery} searchActive={searchActive} />
              </main>
            </div>
          </div>
        </SettingsProvider>
      </AdProvider>
    </ThemeProvider>
  );
}

export default MyApp;