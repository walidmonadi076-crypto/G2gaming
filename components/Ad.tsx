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
    | 'deals_strip'; // Kept for type safety though logic removed
  className?: string;
  showLabel?: boolean;
}

const Ad: React.FC<AdProps> = ({ placement, className = '', showLabel = true }) => {
  const { ads, isLoading } = useAds();
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isIframe, setIsIframe] = useState(false);
  const [scale, setScale] = useState(1);
  
  const ad = ads.find(a => a.placement === placement);

  const getAdConfig = () => {
    switch (placement) {
      case 'game_vertical':
        return { width: 300, height: 600, label: 'Sponsored', mobileScale: false };
      case 'game_horizontal':
        return { width: 300, height: 250, label: 'Advertisement', mobileScale: true };
      case 'shop_square':
        // Changed to 100% width to fill the container nicely
        return { width: '100%', height: 250, label: 'Partner Offer', mobileScale: false };
      case 'blog_skyscraper_left':
      case 'blog_skyscraper_right':
        return { width: 160, height: 600, label: 'Ad', mobileScale: false };
      case 'home_quest_banner':
        return { width: 728, height: 90, label: 'Quest Sponsor', mobileScale: true };
      case 'home_native_game':
        // Native ads should be flexible to fit the grid card
        return { width: '100%', height: '100%', label: 'Sponsored', mobileScale: false };
      case 'quest_page_wall':
        return { width: '100%', height: 800, label: 'Offers', mobileScale: false };
      case 'footer_partner':
        return { width: 728, height: 90, label: 'Partner', mobileScale: true };
      default:
        return { width: 300, height: 250, label: 'Ad', mobileScale: true };
    }
  };
  
  const { width, height, label, mobileScale } = getAdConfig();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setIsIframe(true);
    }
  }, []);

  // Smart Scaling Logic
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
      handleResize(); // Initial check
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mobileScale, width]);
  
  useEffect(() => {
    if (ad?.code && adContainerRef.current && !isIframe) {
      const container = adContainerRef.current;
      container.innerHTML = ''; 

      const tempEl = document.createElement('div');
      tempEl.innerHTML = ad.code;

      // Execute scripts
      tempEl.childNodes.forEach(node => {
        if (node.nodeName === 'SCRIPT') {
          const script = document.createElement('script');
          const oldScript = node as HTMLScriptElement;
          for (let i = 0; i < oldScript.attributes.length; i++) {
            const attr = oldScript.attributes[i];
            script.setAttribute(attr.name, attr.value);
          }
          script.async = false;
          script.innerHTML = oldScript.innerHTML;
          container.appendChild(script);
        } else {
          container.appendChild(node.cloneNode(true));
        }
      });
    }
  }, [ad, isIframe]);

  // Styling: Removed 'overflow-hidden' which was clipping ads
  const isTransparent = ['footer_partner', 'home_native_game'].includes(placement);
  const baseStyles = isTransparent 
    ? '' 
    : 'bg-gray-900/80 border border-white/5 backdrop-blur-sm shadow-lg hover:border-purple-500/20';

  const containerClasses = `relative flex flex-col items-center justify-center p-2 transition-all rounded-xl ${baseStyles} ${className}`;

  // Helper for sizing style
  const sizingStyle = { 
    width: typeof width === 'number' ? width : '100%', 
    height: typeof height === 'number' ? height : 'auto',
    minHeight: typeof height === 'number' ? height : 250 // Ensure space is reserved
  };

  const renderPlaceholder = (text: string, animate: boolean = false) => (
    <div 
      style={sizingStyle} 
      className={`bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center max-w-full ${animate ? 'animate-pulse' : ''}`}
    >
      <span className="text-gray-600 text-xs font-bold uppercase tracking-widest text-center px-2">{text}</span>
    </div>
  );

  return (
    <div className={containerClasses}>
      {showLabel && !isTransparent && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[9px] font-bold text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest select-none z-10 border-b border-r border-white/5">
          {label}
        </span>
      )}
      
      <div 
        className={`w-full flex justify-center items-center relative z-0`}
        style={{ 
            minHeight: typeof height === 'number' && height > 90 ? height * scale : undefined,
            transform: scale < 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'top center',
            marginBottom: scale < 1 && typeof height === 'number' ? -(height * (1 - scale)) : 0
        }} 
      >
        {isIframe ? (
          renderPlaceholder('Ad Preview Disabled')
        ) : isLoading ? (
          renderPlaceholder('Loading...', true)
        ) : (!ad || !ad.code) ? (
          renderPlaceholder('Space Available')
        ) : (
          // ad-content-wrapper must NOT have overflow-hidden to allow popups/overlays if needed
          <div ref={adContainerRef} className="ad-content-wrapper flex justify-center w-full" />
        )}
      </div>
    </div>
  );
};

export default Ad;