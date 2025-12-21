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
  const [scale, setScale] = useState(1);
  
  const adFromContext = ads.find(a => a.placement === placement);
  const codeToRender = overrideCode !== undefined ? overrideCode : adFromContext?.code;

  const getAdConfig = () => {
    switch (placement) {
      case 'game_vertical': return { width: 300, height: 600, label: 'Recommended', mobileScale: false };
      case 'game_horizontal': return { width: 300, height: 250, label: 'Sponsored', mobileScale: true };
      case 'shop_square': return { width: 300, height: 250, label: 'Partner Offer', mobileScale: true };
      case 'blog_skyscraper_left':
      case 'blog_skyscraper_right': return { width: 160, height: 600, label: 'Featured', mobileScale: false };
      case 'home_quest_banner': return { width: 728, height: 90, label: 'Special Mission', mobileScale: true };
      case 'home_native_game': return { width: '100%', height: 250, label: 'Suggested', mobileScale: false };
      case 'quest_page_wall': return { width: '100%', height: 800, label: 'Rewards', mobileScale: false };
      case 'footer_partner': return { width: 728, height: 90, label: 'Partner', mobileScale: true };
      case 'deals_strip': return { width: 120, height: 600, label: 'Hot Deals', mobileScale: false };
      default: return { width: 300, height: 250, label: 'Content', mobileScale: true };
    }
  };
  
  const { width, height, label, mobileScale } = getAdConfig();

  // HYDRATION SHIELD: Prevent SSR mismatch (Fixes Error 418/425)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && mobileScale && typeof window !== 'undefined' && typeof width === 'number') {
      const handleResize = () => {
        const availableWidth = window.innerWidth - 32; 
        if (availableWidth < width) {
          setScale(availableWidth / width);
        } else {
          setScale(1);
        }
      };
      window.addEventListener('resize', handleResize);
      handleResize(); 
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMounted, mobileScale, width]);
  
  // DYNAMIC INJECTION ENGINE: Safely executes JS in ad tags
  useEffect(() => {
    if (isMounted && codeToRender && slotRef.current) {
      const container = slotRef.current;
      container.innerHTML = ''; // Full wipe before injection

      try {
        const range = document.createRange();
        const fragment = range.createContextualFragment(codeToRender);
        const scripts = Array.from(fragment.querySelectorAll('script'));
        
        // Remove from fragment to prevent auto-execution attempts by browser during append
        scripts.forEach(s => s.remove());
        container.appendChild(fragment);

        // Re-inject scripts properly to ensure execution
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            if (oldScript.innerHTML) newScript.textContent = oldScript.innerHTML;
            
            // Log blockages instead of crashing
            newScript.onerror = () => console.warn(`[Ad Engine] Script load blocked for ${placement}. Check domain whitelist/AdBlock.`);
            container.appendChild(newScript);
        });
      } catch (err) {
        console.error("[Ad Engine] Injection Failed:", err);
      }
    }
  }, [isMounted, codeToRender, placement]);

  const isTransparent = ['footer_partner', 'home_native_game', 'deals_strip'].includes(placement);
  const containerClasses = `relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
    isTransparent ? '' : 'bg-gray-900/60 border border-white/5 backdrop-blur-md'
  } ${className}`;

  // Maintain layout stability during SSR
  if (!isMounted) return <div className={containerClasses} style={{ width, height: height || 250, visibility: 'hidden' }} />;

  return (
    <div className={containerClasses} data-slot-id={placement}>
      {showLabel && !isTransparent && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest z-10 border-b border-r border-white/5">
          {label}
        </span>
      )}
      <div style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: typeof height === 'number' ? `${height}px` : 'auto',
        transform: scale < 1 ? `scale(${scale})` : 'none',
        transformOrigin: 'top center',
        marginBottom: scale < 1 && typeof height === 'number' ? -(height * (1 - scale)) : 0
      }} className="relative z-0 flex items-center justify-center overflow-hidden">
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