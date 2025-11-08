
import React from 'react';
import type { SocialLink } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearchFocus: () => void;
    onSearchBlur: () => void;
    onToggleMobileSidebar: () => void;
    socialLinks: SocialLink[];
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onSearchFocus, onSearchBlur, onToggleMobileSidebar, socialLinks }) => {
  return (
    <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0 flex h-16 border-b border-border items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex items-center min-w-0">
        <button 
          onClick={onToggleMobileSidebar}
          className="md:hidden mr-2 p-2 rounded-full text-muted hover:text-text hover:bg-surface-alt"
          aria-label="Open sidebar"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="relative text-muted focus-within:text-text w-full sm:max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className="block w-full bg-surface-alt border border-transparent rounded-md py-2 pl-10 pr-3 text-text placeholder-muted focus:outline-none focus:bg-surface focus:border-accent focus:ring-accent sm:text-sm"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4 ml-4 flex-shrink-0">
        {socialLinks.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.name}
            className="text-muted hover:text-text transition-colors"
            dangerouslySetInnerHTML={{ __html: link.icon_svg }}
          />
        ))}
        <div className="w-px h-6 bg-border" />
        <ThemeSwitcher />
      </div>
    </header>
  );
};

export default Header;