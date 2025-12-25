
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAds } from '../contexts/AdContext';

interface AdProps {
  placement: string;
  className?: string;
  showLabel?: boolean;
  overrideCode?: string;
  isPreview?: boolean;
}

const Ad: React.FC<AdProps> = ({ placement, className = '', showLabel = true, overrideCode, isPreview = false }) => {
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
  
  const code = (showFallback && !isPreview) ? (fallbackCode || primaryCode) : primaryCode;

  useEffect(() => {
    if (isMounted && slotRef.current && lastCodeRef.current !== code) {
      const container = slotRef.current;
      
      // Clean up previous content
      container.innerHTML = '';
      lastCodeRef.current = code || '';
      
      if (!code || code.trim() === '' || code.startsWith('<!--')) {
          if (isPreview) {
              container.innerHTML = `
                <div class="flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl p-8 w-full">
                    <svg class="w-8 h-8 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span class="text-[10px] font-black uppercase tracking-widest opacity-40">Empty Ad Slot</span>
                </div>
              `;
          }
          return;
      }

      try {
        const range = document.createRange();
        const fragment = range.createContextualFragment(code);
        
        // Find all scripts in the fragment
        const scripts = Array.from(fragment.querySelectorAll('script'));
        
        // Remove scripts from fragment so they don't auto-execute (often fails in React)
        scripts.forEach(s => s.remove());
        
        // Append the non-script HTML
        container.appendChild(fragment);
        
        // Manually execute each script
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          
          // Copy all attributes (src, async, data-*, etc)
          Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Copy inline script content
          if (oldScript.innerHTML) {
            newScript.textContent = oldScript.innerHTML;
          }
          
          newScript.async = true;
          // Append to container or head depending on script type
          if (newScript.src) {
              document.head.appendChild(newScript);
          } else {
              container.appendChild(newScript);
          }
        });

        // Smart Fallback Detection (Only for live site, not for admin preview)
        if (!isPreview && !showFallback && fallbackCode) {
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
          if (!showFallback && !isPreview) setShowFallback(true);
      }
    }
  }, [isMounted, code, showFallback, isPreview, fallbackCode, placement]);

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-xl bg-gray-900/40 border border-white/5 transition-all duration-500 overflow-hidden ${className}`}>
      {isMounted && showLabel && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest z-10">
          {showFallback ? 'Promoted' : 'Partner Link'}
        </span>
      )}
      <div className="w-full flex justify-center items-center min-h-[90px]">
        {!isMounted || (isLoading && !isPreview) ? (
          <div className="animate-pulse bg-white/5 rounded-lg w-full h-[90px]" />
        ) : (
          <div ref={slotRef} className="w-full h-full flex justify-center items-center overflow-hidden" />
        )}
      </div>
      {showFallback && !isPreview && (
          <div className="absolute inset-0 pointer-events-none border-2 border-orange-500/20 rounded-xl" />
      )}
    </div>
  );
};

export default Ad;
