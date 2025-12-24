
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAds } from '../contexts/AdContext';

interface AdProps {
  placement: string;
  className?: string;
  showLabel?: boolean;
  overrideCode?: string;
}

const Ad: React.FC<AdProps> = ({ placement, className = '', showLabel = true, overrideCode }) => {
  const { ads, isLoading } = useAds();
  const slotRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const lastCodeRef = useRef<string | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const adData = useMemo(() => ads.find(a => a.placement === placement), [ads, placement]);
  
  // Decide which code to use: Primary or Fallback
  const primaryCode = overrideCode !== undefined ? overrideCode : adData?.code;
  const fallbackCode = (adData as any)?.fallback_code;
  
  const code = showFallback ? (fallbackCode || primaryCode) : primaryCode;

  useEffect(() => {
    if (isMounted && code && slotRef.current && lastCodeRef.current !== code) {
      const container = slotRef.current;
      container.innerHTML = '';
      lastCodeRef.current = code;
      
      try {
        const range = document.createRange();
        const fragment = range.createContextualFragment(code);
        const scripts = Array.from(fragment.querySelectorAll('script'));
        scripts.forEach(s => s.remove());
        container.appendChild(fragment);
        
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          if (oldScript.innerHTML) newScript.textContent = oldScript.innerHTML;
          newScript.async = true;
          container.appendChild(newScript);
        });

        // Smart Fallback Detection:
        // After 4 seconds, if the container height is very small (indicating ad script failed or stayed hidden)
        // AND we haven't already switched to fallback, trigger fallback.
        if (!showFallback && fallbackCode) {
           const timer = setTimeout(() => {
              if (container.offsetHeight < 10 && container.innerText.trim().length === 0) {
                  console.debug(`Ad placement [${placement}] seems empty. Activating fallback.`);
                  setShowFallback(true);
              }
           }, 4000);
           return () => clearTimeout(timer);
        }

      } catch (e) {
          console.error("Ad injection error:", e);
          if (!showFallback) setShowFallback(true);
      }
    }
  }, [isMounted, code, showFallback, fallbackCode, placement]);

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-xl bg-gray-900/40 border border-white/5 transition-all duration-500 overflow-hidden ${className}`}>
      {isMounted && showLabel && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest z-10">
          {showFallback ? 'Promoted' : 'Partner Link'}
        </span>
      )}
      <div className="w-full flex justify-center items-center min-h-[90px]">
        {!isMounted || isLoading ? (
          <div className="animate-pulse bg-white/5 rounded-lg w-full h-[90px]" />
        ) : (
          <div ref={slotRef} className="w-full h-full flex justify-center items-center" />
        )}
      </div>
      {showFallback && (
          <div className="absolute inset-0 pointer-events-none border-2 border-orange-500/20 rounded-xl" />
      )}
    </div>
  );
};

export default Ad;
