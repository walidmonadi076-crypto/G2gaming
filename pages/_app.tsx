
import React, { useState, useEffect } from 'react';
import App, { type AppProps, type AppContext } from 'next/app';
import { useRouter } from 'next/router';
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

// Define default settings to be used for the initial server render and as a fallback.
// This prevents crashes during the build process.
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

type MyAppProps = AppProps & {
  pageProps: {
    settings: SiteSettings;
  };
};

function MyApp({ Component, pageProps }: MyAppProps) {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  
  // State to hold the site settings. It's initialized with props from getInitialProps
  // (which will be our defaults) and then updated client-side.
  const [settings, setSettings] = useState<SiteSettings>(pageProps.settings);

  // The admin panel should not have the public layout. We identify the login page
  // specifically, allowing other `/admin/*` routes (like previews) to use the public layout.
  const isAdminPage = router.pathname === '/admin/login';


  useEffect(() => {
    // This effect runs only on the client-side after hydration.
    // It fetches the latest site settings and social links from the API.
    const fetchClientSideData = async () => {
      // Fetch dynamic site settings.
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data);
        } else {
          console.error('Failed to fetch settings on client, using defaults.');
        }
      } catch (error) {
        console.error('Error fetching settings, using defaults:', error);
      }
      
      // Fetch social links if not on an admin page.
      if (!isAdminPage) {
        try {
          const socialLinksRes = await fetch('/api/social-links');
          if (socialLinksRes.ok) {
            const data = await socialLinksRes.json();
            if(Array.isArray(data)) {
                setSocialLinks(data);
            }
          }
        } catch (error) {
           console.error('Failed to fetch social links:', error);
        }
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

  const enhancedPageProps = {
    ...pageProps,
    searchQuery,
    searchActive,
  };
  
  if (isAdminPage) {
    return <Component {...pageProps} />;
  }

  return (
    <ThemeProvider>
      <AdProvider>
        {/* The SettingsProvider now uses the stateful `settings` variable,
            which will update automatically after the client-side fetch. */}
        <SettingsProvider value={settings}>
          <div className={`bg-gray-900 text-white min-h-screen flex ${inter.variable} font-sans`}>
            {isMobileSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/60 z-50 md:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-hidden="true"
              ></div>
            )}
            <Sidebar
              isExpanded={isSidebarExpanded}
              onMouseEnter={() => setIsSidebarExpanded(true)}
              onMouseLeave={() => setIsSidebarExpanded(false)}
              isMobileOpen={isMobileSidebarOpen}
              onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
            <div
              className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'
              }`}
            >
              <Header
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearchFocus={() => setSearchActive(true)}
                onSearchBlur={() => setTimeout(() => setSearchActive(false), 200)}
                onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                socialLinks={socialLinks}
              />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
                <Component {...enhancedPageProps} />
              </main>
            </div>
          </div>
        </SettingsProvider>
      </AdProvider>
    </ThemeProvider>
  );
}

// FIX: getInitialProps is simplified to avoid server-side/build-time fetches.
// It now only provides default settings for the initial render.
// The actual, dynamic settings are fetched on the client-side in the `useEffect` hook.
// This resolves the build error caused by trying to fetch from an undefined URL.
MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  appProps.pageProps.settings = defaultSettings;
  return appProps;
};

export default MyApp;
