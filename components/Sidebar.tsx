import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ICONS, POPULAR_GAME_CATEGORIES, POPULAR_BLOG_CATEGORIES, POPULAR_SHOP_CATEGORIES } from '../constants';

interface SidebarProps {
    isExpanded: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onMouseEnter, onMouseLeave, isMobileOpen, onMobileClose }) => {
  const router = useRouter();
  
  const navItems = [
    { href: '/', icon: ICONS.HOME, label: 'Home' },
    { href: '/games', icon: ICONS.ACTION, label: 'Games' },
    { href: '/blog', icon: ICONS.BLOG, label: 'Blog' },
    { href: '/shop', icon: ICONS.STORE, label: 'Shop' },
  ];

  const { popularLinks, parentPath } = useMemo(() => {
    const path = router.pathname;
    if (path.startsWith('/blog')) {
      return { popularLinks: POPULAR_BLOG_CATEGORIES, parentPath: '/blog' };
    }
    if (path.startsWith('/shop')) {
      return { popularLinks: POPULAR_SHOP_CATEGORIES, parentPath: '/shop' };
    }
    // Default to games for both '/' and '/games'
    return { popularLinks: POPULAR_GAME_CATEGORIES, parentPath: '/games' };
  }, [router.pathname]);

  const isFullyExpanded = isExpanded || isMobileOpen;

  return (
    <nav 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed top-0 left-0 h-full bg-surface border-r border-border flex flex-col py-4 z-[60]
                   transition-all duration-300 ease-in-out
                   ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                   md:translate-x-0 
                   ${isExpanded ? 'md:w-64' : 'md:w-20'}
                   ${isFullyExpanded ? 'items-start' : 'items-center'}`}
    >
      <div className={`flex items-center text-accent mb-6 w-full ${isFullyExpanded ? 'pl-6' : 'justify-center'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className={`text-xl font-bold text-text whitespace-nowrap transition-all duration-200 ${isFullyExpanded ? 'ml-3 opacity-100' : 'w-0 opacity-0'}`}>
            G2gaming
        </span>
      </div>

      <ul className="w-full px-4 space-y-2">
        {navItems.map(item => {
          const isActive = (item.href === '/' && router.pathname === '/') || (item.href !== '/' && router.pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onMobileClose}
                className={
                  `flex items-center p-3 rounded-lg transition-all duration-200
                   ${isActive ? 'bg-accent text-white' : 'text-muted hover:bg-surface-alt hover:text-text'}
                   ${isFullyExpanded ? 'w-full' : 'w-12 h-12 justify-center'}`
                }
                title={isFullyExpanded ? '' : item.label}
              >
                {React.cloneElement(item.icon, { className: 'h-6 w-6 flex-shrink-0' })}
                <span className={`whitespace-nowrap transition-all duration-200 ${isFullyExpanded ? 'ml-4 opacity-100' : 'w-0 opacity-0'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4 w-full">
        <div className={`w-full px-4 mb-2 ${isFullyExpanded ? 'pl-7' : 'text-center'}`}>
            <h3 className={`text-xs font-semibold text-muted uppercase tracking-wider transition-opacity duration-200 ${isFullyExpanded ? 'opacity-100' : 'opacity-0'}`}>
                Popular
            </h3>
        </div>
        <ul className="w-full px-4 space-y-2">
            {popularLinks.map(item => {
                const href = {
                  pathname: parentPath,
                  query: { category: item.value },
                };
                const isActive = router.pathname === href.pathname && router.query.category === item.value;
                
                return (
                    <li key={item.value}>
                        <Link
                          href={href}
                          onClick={onMobileClose}
                          className={
                              `flex items-center p-3 rounded-lg transition-all duration-200
                              ${isActive ? 'bg-accent text-white' : 'text-muted hover:bg-surface-alt hover:text-text'}
                              ${isFullyExpanded ? 'w-full' : 'w-12 h-12 justify-center'}`
                          }
                          title={isFullyExpanded ? '' : item.label}
                        >
                          {React.cloneElement(item.icon, { className: 'h-6 w-6 flex-shrink-0' })}
                          <span className={`whitespace-nowrap transition-all duration-200 ${isFullyExpanded ? 'ml-4 opacity-100' : 'w-0 opacity-0'}`}>
                              {item.label}
                          </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;