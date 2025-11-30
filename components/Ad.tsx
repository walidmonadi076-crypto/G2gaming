
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
    | 'deals_strip'
    | 'quest_page_wall'
    | 'footer_partner';
  className?: string;
  showLabel?: boolean;
}

const Ad: React.FC<AdProps> = ({ placement, className = '', showLabel = true }) => {
  const { ads, isLoading } = useAds();
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isIframe, setIsIframe] = useState(false);
  
  const ad = ads.find(a => a.placement === placement);

  const getAdConfig = () => {
    switch (placement) {
      case 'game_vertical':
        return { width: 300, height: 600, label: 'Sponsored' };
      case 'game_horizontal':
        // Matched to Admin Panel config: "Game Page Mobile (Horizontal)"
        // Using 300x250 as a standard mobile-friendly rectangle.
        return { width: 300, height: 250, label: 'Advertisement' };
      case 'shop_square':
        return { width: 300, height: 250, label: 'Partner Offer' };
      case 'blog_skyscraper_left':
      case 'blog_skyscraper_right':
        return { width: 160, height: 600, label: 'Ad' };
      case 'home_quest_banner':
        return { width: 728, height: 90, label: 'Quest Sponsor' };
      case 'home_native_game':
        return { width: 300, height: 250, label: 'Sponsored' };
      case 'deals_strip':
        return { width: 120, height: 600, label: 'Hot Deals' };
      case 'quest_page_wall':
        return { width: '100%', height: 800, label: 'Offers' };
      case 'footer_partner':
        return { width: 300, height: 100, label: 'Partner' };
      default:
        return { width: 300, height: 250, label: 'Ad' };
    }
  };
  
  const { width, height, label } = getAdConfig();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setIsIframe(true);
    }
  }, []);
  
  useEffect(() => {
    if (ad?.code && adContainerRef.current && !isIframe) {
      const container = adContainerRef.current;
      container.innerHTML = ''; 

      const tempEl = document.createElement('div');
      tempEl.innerHTML = ad.code;

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

  // Special container styling based on placement
  const isTransparent = ['deals_strip', 'footer_partner'].includes(placement);
  const baseStyles = isTransparent 
    ? '' 
    : 'bg-gray-900/80 border border-white/5 backdrop-blur-sm shadow-sm hover:border-white/10';

  const containerClasses = `relative rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 transition-all ${baseStyles} ${className}`;

  // Content for Preview/Loading/Error states
  const renderPlaceholder = (text: string, animate: boolean = false) => (
    <div 
      style={{ 
        width: typeof width === 'number' ? width : '100%', 
        maxWidth: '100%', // Ensure it doesn't overflow mobile screens
        height: height, 
        maxHeight: '100%' 
      }} 
      className={`bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center ${animate ? 'animate-pulse' : ''}`}
    >
      <span className="text-gray-600 text-xs font-bold uppercase tracking-widest text-center px-2">{text}</span>
    </div>
  );

  return (
    <div className={containerClasses}>
      {showLabel && !isTransparent && (
        <span className="absolute top-1 left-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest select-none z-10">
          {label}
        </span>
      )}
      
      <div 
        className="w-full flex justify-center items-center overflow-hidden relative z-0"
        style={{ minHeight: typeof height === 'number' && height > 90 ? height : undefined }} 
      >
        {isIframe ? (
          renderPlaceholder('Ad Preview Disabled')
        ) : isLoading ? (
          renderPlaceholder('Loading...', true)
        ) : (!ad || !ad.code) ? (
          renderPlaceholder('Space Available')
        ) : (
          <div ref={adContainerRef} className="ad-content-wrapper w-full h-full flex justify-center" />
        )}
      </div>
    </div>
  );
};

export default Ad;
