
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ShareBarProps {
  title: string;
  orientation?: 'vertical' | 'horizontal';
  initialCount?: number; // Prop to set a base fake number
}

const socialPlatforms = [
  { name: 'Facebook', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z"/></svg>, color: 'hover:bg-[#1877F2]', shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}' },
  { name: 'WhatsApp', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.5-1.8-.2-.3 0-.5.1-.6.1-.1.2-.3.4-.4.1-.1.2-.3.3-.5.1-.2.1-.4 0-.5C10 9.2 9.5 8 9.3 7.5c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.2-.7.4-.2.2-.8.8-.8 2s.8 2.3 1 2.4c.1.2 1.5 2.4 3.7 3.3.5.2.9.3 1.2.4.5.1 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.6.2-1.1.1-1.2s-.2-.2-.4-.3zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18.2c-1.6 0-3.2-.4-4.5-1.2l-4.8 1.3 1.3-4.7c-.8-1.4-1.3-3-1.3-4.6 0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.6 8.2-8.2 8.2z"/></svg>, color: 'hover:bg-[#25D366]', shareUrl: 'https://api.whatsapp.com/send?text={title}%20{url}' },
  { name: 'X', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931L18.901 1.153zm-1.61 19.7h2.54l-14.48-18.4h-2.939L17.291 20.853z"/></svg>, color: 'hover:bg-black', shareUrl: 'https://twitter.com/intent/tweet?url={url}&text={title}' },
  { name: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-11 6H5v10h3V9m-1.5-2a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3M19 9h-2.5a3.5 3.5 0 0 0-3.5 3.5V19h3v-5.5c0-.83.22-1.5.75-1.5s.75.67.75 1.5V19h3V12.5A3.5 3.5 0 0 0 19 9z"/></svg>, color: 'hover:bg-[#0077B5]', shareUrl: 'https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}' },
];

const ShareBar: React.FC<ShareBarProps> = ({ title, orientation = 'vertical', initialCount = 142 }) => {
  const router = useRouter();
  // Start with a static number (e.g. 142) so it never shows 0.
  const [shareCount, setShareCount] = useState(initialCount);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    // Ensuring we are on the client
    if (typeof window !== 'undefined') {
        setCurrentUrl(window.location.href);
    }
  }, [router.asPath]);

  const handleShare = (shareUrl: string) => {
    const finalUrl = shareUrl
      .replace('{url}', encodeURIComponent(currentUrl))
      .replace('{title}', encodeURIComponent(title));
    
    // Open share window
    window.open(finalUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    
    // Increment visual counter instantly (Instant Gratification)
    if (!hasShared) {
        setShareCount(prev => prev + 1);
        setHasShared(true);
    }
  };

  const isVertical = orientation === 'vertical';

  // --- VERTICAL MODE (Smart Fixed HUD Widget) ---
  if (isVertical) {
    return (
        <div 
            className={`
                fixed left-4 top-1/2 -translate-y-1/2 z-[100]
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]
                flex flex-col items-center
                ${isMinimized ? 'w-12 py-3 rounded-full opacity-70 hover:opacity-100 cursor-pointer' : 'w-16 py-6 rounded-2xl'}
            `}
            style={{ willChange: 'transform, opacity' }}
            onClick={isMinimized ? () => setIsMinimized(false) : undefined}
        >
            {/* Header: Share Icon + Count */}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="flex flex-col items-center mb-4 group w-full"
                title={isMinimized ? "Show Share Options" : "Hide"}
            >
                <div className={`
                    flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 transition-all duration-300
                    ${isMinimized ? 'w-8 h-8 scale-100 ring-2 ring-white/10' : 'w-10 h-10 group-hover:scale-110 ring-4 ring-purple-500/20'}
                `}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                </div>
                
                <span className={`
                    mt-2 font-black text-white text-xs tracking-wider transition-all duration-300
                    ${hasShared ? 'text-green-400 scale-110' : ''}
                    ${isMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}
                `}>
                    {shareCount}
                </span>
                {!isMinimized && <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Shares</span>}
            </button>

            {/* Expandable Icons Area */}
            <div className={`
                flex flex-col gap-3 transition-all duration-500 overflow-hidden
                ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[300px] opacity-100'}
            `}>
                {socialPlatforms.map((platform, idx) => (
                    <button
                        key={platform.name}
                        onClick={(e) => { e.stopPropagation(); handleShare(platform.shareUrl); }}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-gray-400 bg-gray-800/50 border border-white/5
                            transition-all duration-300 transform hover:scale-110 hover:text-white hover:shadow-[0_0_15px_currentColor] hover:-translate-y-1
                            ${platform.color}
                        `}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                        title={`Share on ${platform.name}`}
                    >
                        {platform.icon}
                    </button>
                ))}
            </div>

            {/* Toggle Arrow */}
            {!isMinimized && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                    className="mt-4 text-gray-600 hover:text-purple-400 transition-colors group"
                    aria-label="Minimize"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            )}
        </div>
    );
  }

  // --- HORIZONTAL MODE (Mobile/Footer) ---
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {socialPlatforms.map(platform => (
        <button
          key={platform.name}
          onClick={() => handleShare(platform.shareUrl)}
          className={`
            bg-gray-800 text-white font-semibold py-2 px-4 gap-2 rounded-lg flex items-center
            transition-transform hover:scale-105 shadow-md hover:shadow-purple-500/20
            ${platform.color} group
          `}
        >
          {platform.icon}
          <span className='text-sm group-hover:text-white transition-colors'>{platform.name}</span>
        </button>
      ))}
       <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg border border-gray-800">
            <span className="font-bold text-white">{shareCount}</span>
            <span className="text-xs text-gray-500 uppercase">Shares</span>
       </div>
    </div>
  );
};

export default ShareBar;
