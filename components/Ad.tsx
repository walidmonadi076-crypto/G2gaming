"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAds } from '../contexts/AdContext';

interface AdProps {
  placement: 
    | 'game_vertical' 
    | 'game_horizontal' 
    | 'shop_square' 
    | 'blog_skyscraper_left' 
    | 'blog_skyscraper_right'
    | 'home_quest_banner'
    | 'home_native_game'
    | 'quest_page_wall'
    | 'footer_partner'
    | 'deals_strip';
  className?: string;
  showLabel?: boolean;
  overrideCode?: string;
}

const Ad: React.FC<AdProps> = ({ placement, className = '', showLabel = true, overrideCode }) => {
  const { ads, isLoading } = useAds();
  const slotRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const adFromContext = ads.find(a => a.placement === placement);
  const codeToRender = overrideCode !== undefined ? overrideCode : adFromContext?.code;

  const getAdConfig = () => {
    switch (placement) {
      case 'game_vertical': return { width: 300, height: 600, label: 'Recommended' };
      case 'game_horizontal': return { width: 300, height: 250, label: 'Sponsored' };
      case 'shop_square': return { width: 300, height: 250, label: 'Partner Offer' };
      case 'blog_skyscraper_left':
      case 'blog_skyscraper_right': return { width: 160, height: 600, label: 'Featured' };
      case 'home_quest_banner': return { width: 728, height: 90, label: 'Special Mission' };
      case 'home_native_game': return { width: '100%', height: 250, label: 'Suggested' };
      case 'quest_page_wall': return { width: '100%', height: 800, label: 'Rewards' };
      case 'footer_partner': return { width: 728, height: 90, label: 'Partner' };
      case 'deals_strip': return { width: 120, height: 600, label: 'Hot Deals' };
      default: return { width: 300, height: 250, label: 'Content' };
    }
  };
  
  const { width, height, label } = getAdConfig();

  // STABILIZE DIMENSIONS FOR HYDRATION - CRITICAL FOR ERROR 425
  // We use string templates to ensure both server and client produce the exact same style strings (e.g. "728px")
  const cssWidth = typeof width === 'number' ? `${width}px` : width;
  const cssHeight = typeof height === 'number' ? `${height}px` : (height ? `${height}px` : '250px');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && codeToRender && slotRef.current) {
      const container = slotRef.current;
      container.innerHTML = ''; 
      try {
        const range = document.createRange();
        const fragment = range.createContextualFragment(codeToRender);
        const scripts = Array.from(fragment.querySelectorAll('script'));
        scripts.forEach(s => s.remove());
        container.appendChild(fragment);
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            if (oldScript.innerHTML) newScript.textContent = oldScript.innerHTML;
            container.appendChild(newScript);
        });
      } catch (err) { console.error("[Ad Engine] Injection Failed:", err); }
    }
  }, [isMounted, codeToRender, placement]);

  const isTransparent = ['footer_partner', 'home_native_game', 'deals_strip'].includes(placement);
  const containerClasses = `relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
    isTransparent ? '' : 'bg-gray-900/60 border border-white/5 backdrop-blur-md'
  } ${className}`;

  if (!isMounted) {
    return (
      <div 
        className={containerClasses} 
        style={{ width: cssWidth, height: cssHeight, opacity: 0 }}
        data-slot-id={placement}
        suppressHydrationWarning={true}
      />
    );
  }

  return (
    <div className={containerClasses} data-slot-id={placement} suppressHydrationWarning={true}>
      {showLabel && !isTransparent && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest z-10 border-b border-r border-white/5">
          {label}
        </span>
      )}
      <div style={{ width: cssWidth, minHeight: cssHeight }} className="relative z-0 flex items-center justify-center overflow-hidden">
        {isLoading && overrideCode === undefined ? (
          <div className="animate-pulse bg-white/5 rounded-lg w-full h-full min-h-[250px]" />
        ) : (
          <div ref={slotRef} className="w-full h-full flex justify-center items-center" />
        )}
      </div>
    </div>
  );
};

export default Ad;