
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAds } from '../contexts/AdContext';

interface AdProps {
  placement: 'game_vertical' | 'game_horizontal' | 'shop_square' | 'blog_skyscraper_left' | 'blog_skyscraper_right';
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
        return { width: 728, height: 90, label: 'Advertisement' };
      case 'shop_square':
        return { width: 300, height: 250, label: 'Partner Offer' };
      case 'blog_skyscraper_left':
      case 'blog_skyscraper_right':
        return { width: 160, height: 600, label: 'Ad' };
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

  const containerClasses = `relative bg-gray-900/80 border border-white/5 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 backdrop-blur-sm shadow-sm transition-all hover:border-white/10 ${className}`;

  // Content for Preview/Loading/Error states
  const renderPlaceholder = (text: string, animate: boolean = false) => (
    <div 
      style={{ width: '100%', height: height, maxHeight: '100%' }} 
      className={`bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center ${animate ? 'animate-pulse' : ''}`}
    >
      <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">{text}</span>
    </div>
  );

  return (
    <div className={containerClasses}>
      {showLabel && (
        <span className="absolute top-1 left-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest select-none">
          {label}
        </span>
      )}
      
      <div 
        className="w-full flex justify-center items-center overflow-hidden mt-2"
        style={{ minHeight: height > 90 ? height : undefined }} 
      >
        {isIframe ? (
          renderPlaceholder('Ad Preview Disabled')
        ) : isLoading ? (
          renderPlaceholder('Loading...', true)
        ) : (!ad || !ad.code) ? (
          renderPlaceholder('Space Available')
        ) : (
          <div ref={adContainerRef} className="ad-content-wrapper" />
        )}
      </div>
    </div>
  );
};

export default Ad;
