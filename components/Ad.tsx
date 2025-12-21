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
  
  // Find the code: prioritize override (for admin preview) then context
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

  // HYDRATION GUARD: Never render script injection on server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle mobile scaling
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
  
  // DYNAMIC INJECTION ENGINE
  useEffect(() => {
    if (isMounted && codeToRender && slotRef.current) {
      const container = slotRef.current;
      
      // 1. Clean previous contents
      container.innerHTML = ''; 

      try {
        const range = document.createRange();
        const fragment = range.createContextualFragment(codeToRender);

        // 2. Manual Script Re-insertion: Standard innerHTML/fragment doesn't execute <script> tags
        const scripts = Array.from(fragment.querySelectorAll('script'));
        
        // Remove scripts from fragment to prevent double-insertion if browser tries to process them
        scripts.forEach(s => s.remove());

        // 3. Append the static HTML parts first
        container.appendChild(fragment);

        // 4. Create and append new script tags one by one
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            
            // Copy attributes (src, type, async, etc.)
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy inner code if it's an inline script
            if (oldScript.innerHTML) {
                newScript.textContent = oldScript.innerHTML;
            }

            // Error handling for 403s
            newScript.onerror = () => {
                console.warn(`[Ad Engine] Script failed for ${placement}. Check domain authorization or AdBlock.`);
            };

            container.appendChild(newScript);
        });
      } catch (err) {
        console.error("[Ad Engine] Critical Rendering Error:", err);
      }
    }
  }, [isMounted, codeToRender, placement]);

  const isTransparent = ['footer_partner', 'home_native_game', 'deals_strip'].includes(placement);
  
  const containerClasses = `relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
    isTransparent ? '' : 'bg-gray-900/60 border border-white/5 backdrop-blur-md'
  } ${className}`;

  const containerStyle = { 
    width: typeof width === 'number' ? `${width}px` : width,
    minHeight: typeof height === 'number' ? `${height}px` : 'auto',
    transform: scale < 1 ? `scale(${scale})` : 'none',
    transformOrigin: 'top center',
    marginBottom: scale < 1 && typeof height === 'number' ? -(height * (1 - scale)) : 0
  };

  // Prevent any server-side rendering of the ad slot to fix Error 418
  if (!isMounted) return <div className={containerClasses} style={{ width, height: height || 250 }} />;

  return (
    <div className={containerClasses} data-slot-id={placement}>
      {showLabel && !isTransparent && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest z-10 border-b border-r border-white/5">
          {label}
        </span>
      )}
      
      <div style={containerStyle} className="relative z-0 flex items-center justify-center overflow-hidden">
        {isLoading && overrideCode === undefined ? (
          <div className="animate-pulse bg-white/5 rounded-lg w-full h-full min-h-[250px]" />
        ) : (
          <div ref={slotRef} className="slot-content-render-target w-full h-full flex justify-center items-center" />
        )}
      </div>
    </div>
  );
};

export default Ad;