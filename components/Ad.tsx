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
  const [isIframe, setIsIframe] = useState(false);
  const [scale, setScale] = useState(1);
  
  const adFromContext = ads.find(a => a.placement === placement);
  const codeToRender = overrideCode !== undefined ? overrideCode : adFromContext?.code;

  const getAdConfig = () => {
    switch (placement) {
      case 'game_vertical':
        return { width: 300, height: 600, label: 'Recommended', mobileScale: false };
      case 'game_horizontal':
        return { width: 300, height: 250, label: 'Sponsored Content', mobileScale: true };
      case 'shop_square':
        return { width: 300, height: 250, label: 'Partner Offer', mobileScale: true };
      case 'blog_skyscraper_left':
      case 'blog_skyscraper_right':
        return { width: 160, height: 600, label: 'Featured', mobileScale: false };
      case 'home_quest_banner':
        return { width: 728, height: 90, label: 'Special Mission', mobileScale: true };
      case 'home_native_game':
        return { width: '100%', height: 250, label: 'Suggested', mobileScale: false };
      case 'quest_page_wall':
        return { width: '100%', height: 800, label: 'Rewards', mobileScale: false };
      case 'footer_partner':
        return { width: 728, height: 90, label: 'Partner', mobileScale: true };
      case 'deals_strip':
        return { width: 120, height: 600, label: 'Hot Deals', mobileScale: false };
      default:
        return { width: 300, height: 250, label: 'Content', mobileScale: true };
    }
  };
  
  const { width, height, label, mobileScale } = getAdConfig();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setIsIframe(true);
    }
  }, []);

  useEffect(() => {
    if (mobileScale && typeof window !== 'undefined' && typeof width === 'number') {
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
  }, [mobileScale, width]);
  
  useEffect(() => {
    if (codeToRender && slotRef.current && !isIframe) {
      const container = slotRef.current;
      container.innerHTML = ''; 

      try {
        const range = document.createRange();
        const fragment = range.createContextualFragment(codeToRender);

        // Manual script execution with safety
        const scripts = Array.from(fragment.querySelectorAll('script'));
        scripts.forEach(oldScript => {
            try {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                if (oldScript.innerHTML) {
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                }
                // Handle script loading errors (like 403 Forbidden)
                newScript.onerror = () => {
                    console.warn(`Ad script failed to load for ${placement}. This might be due to an AdBlocker or 403 error.`);
                };
                oldScript.parentNode?.replaceChild(newScript, oldScript);
            } catch (innerErr) {
                console.error("Script injection error:", innerErr);
            }
        });

        container.appendChild(fragment);
      } catch (err) {
        console.error("Ad context rendering failed:", err);
      }
    } else if (slotRef.current) {
        slotRef.current.innerHTML = '';
    }
  }, [codeToRender, isIframe, placement]);

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

  if (isIframe) return null;

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