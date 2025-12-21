import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ICONS, ICON_MAP } from '../constants';
import { useTheme, useSettings } from '../contexts/AdContext';

interface SidebarProps {
    isExpanded: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

interface SidebarCategory {
    id: string;
    name: string;
    slug: string;
    icon_name: string;
}

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const ThemeToggle = ({ isExpanded }: { isExpanded: boolean }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return <div className="h-12 w-12" />;

  return (
    <button
      onClick={toggleTheme}
      className={
        `flex items-center p-3 rounded-lg transition-all duration-200 text-gray-400 hover:bg-gray-700 hover:text-white
         ${isExpanded ? 'w-full' : 'w-12 h-12 justify-center'}`
      }
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      <span className={`whitespace-nowrap transition-all duration-200 ${isExpanded ? 'ml-4 opacity-100' : 'w-0 opacity-0 h-0 overflow-hidden'}`}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

const Sidebar = ({ isExpanded, onMouseEnter, onMouseLeave, isMobileOpen, onMobileClose }: SidebarProps) => {
  const router = useRouter();
  const { settings } = useSettings();
  const [popularCategories, setPopularCategories] = useState<SidebarCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navItems = [
    { href: '/', icon: ICONS.HOME, label: 'Home' },
    { href: '/games', icon: ICONS.ACTION, label: 'Games' },
    { href: '/blog', icon: ICONS.BLOG, label: 'Blog' },
    { href: '/shop', icon: ICONS.STORE, label: 'Shop' },
  ];

  const currentSection = useMemo(() => {
    const path = router.pathname;
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/shop')) return 'shop';
    return 'games';
  }, [router.pathname]);

  const parentPath = useMemo(() => {
      if (currentSection === 'blog') return '/blog';
      if (currentSection === 'shop') return '/shop';
      return '/games';
  }, [currentSection]);

  useEffect(() => {
      const fetchCategories = async () => {
          if (!mounted) return;
          setLoadingCats(true);
          try {
              const res = await fetch(`/api/public/sidebar-categories?section=${currentSection}`);
              if (res.ok) {
                  const data = await res.json();
                  setPopularCategories(data);
              }
          } catch (e) { console.error(e); }
          finally { setLoadingCats(false); }
      };
      fetchCategories();
  }, [currentSection, mounted]);

  const isFullyExpanded = isExpanded || isMobileOpen;

  return (
    <nav 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 flex flex-col py-4 z-[60]
                   transition-all duration-300 ease-in-out
                   ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                   md:translate-x-0 
                   ${isExpanded ? 'md:w-64' : 'md:w-20'}
                   ${isFullyExpanded ? 'items-start' : 'items-center'}`}
        suppressHydrationWarning={true}
    >
      <div className={`flex items-center text-purple-500 mb-6 w-full ${isFullyExpanded ? 'pl-6' : 'justify-center'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className={`text-xl font-bold text-white whitespace-nowrap transition-all duration-200 ${isFullyExpanded ? 'ml-3 opacity-100' : 'w-0 opacity-0 h-0 overflow-hidden'}`}>
            {settings.site_name}
        </span>
      </div>

      <ul className="w-full px-4 space-y-2">
        {navItems.map(item => {
          const isActive = mounted && ((item.href === '/' && router.pathname === '/') || (item.href !== '/' && router.pathname.startsWith(item.href)));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onMobileClose}
                className={
                  `flex items-center p-3 rounded-lg transition-all duration-200
                   ${isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
                   ${isFullyExpanded ? 'w-full' : 'w-12 h-12 justify-center'}`
                }
              >
                {React.cloneElement(item.icon, { className: 'h-6 w-6 flex-shrink-0' })}
                <span className={`whitespace-nowrap transition-all duration-200 ${isFullyExpanded ? 'ml-4 opacity-100' : 'w-0 opacity-0 h-0 overflow-hidden'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4 w-full flex-1 overflow-y-auto no-scrollbar">
         <div className="w-full px-4 mb-2">
            <ThemeToggle isExpanded={isFullyExpanded} />
        </div>
        
        {mounted && (
          <div suppressHydrationWarning={true}>
            <div className={`w-full px-4 mb-2 mt-4 ${isFullyExpanded ? 'pl-7' : 'text-center'}`}>
                <h3 className={`text-[10px] font-black text-gray-500 uppercase tracking-widest transition-opacity duration-200 ${isFullyExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    Discover
                </h3>
            </div>
            
            <ul className="w-full px-4 space-y-1">
                {loadingCats ? (
                    [1, 2, 3].map(i => <li key={i} className="h-10 rounded-lg bg-gray-700/30 animate-pulse mb-1" />)
                ) : (
                    popularCategories.map(item => {
                        const IconComponent = ICON_MAP[item.icon_name] || ICON_MAP['Gamepad2'];
                        const isActive = router.query.category === item.name;
                        return (
                            <li key={item.id}>
                                <Link
                                  href={{ pathname: parentPath, query: { category: item.name } }}
                                  onClick={onMobileClose}
                                  className={`flex items-center p-2 rounded-lg transition-all duration-200 group
                                      ${isActive ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400 hover:bg-gray-800/70 hover:text-white'}
                                      ${isFullyExpanded ? 'w-full' : 'w-10 h-10 justify-center mx-auto'}`}
                                >
                                  <div className="flex-shrink-0">{React.isValidElement(IconComponent) ? React.cloneElement(IconComponent as any, { width: 18, height: 18 }) : null}</div>
                                  <span className={`whitespace-nowrap text-xs font-bold transition-all duration-200 overflow-hidden ${isFullyExpanded ? 'ml-3 opacity-100' : 'w-0 opacity-0 ml-0 h-0'}`}>
                                      {item.name}
                                  </span>
                                </Link>
                            </li>
                        );
                    })
                )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;