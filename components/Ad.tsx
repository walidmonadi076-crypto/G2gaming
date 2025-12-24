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
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const adData = useMemo(() => ads.find(a => a.placement === placement), [ads, placement]);
  const code = overrideCode !== undefined ? overrideCode : adData?.code;
  const lastCodeRef = useRef<string | null>(null);

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
      } catch (e) {
          console.error("Ad injection error:", e);
      }
    }
  }, [isMounted, code]);

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-xl bg-gray-900/40 border border-white/5 ${className}`}>
      {/* FIX: Avoid conditional rendering of spans that could lead to mismatch */}
      {isMounted && showLabel && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest z-10">Partner Link</span>
      )}
      <div className="w-full flex justify-center items-center min-h-[90px]">
        {!isMounted || isLoading ? (
          <div className="animate-pulse bg-white/5 rounded-lg w-full h-[90px]" />
        ) : (
          <div ref={slotRef} className="w-full h-full flex justify-center items-center" />
        )}
      </div>
    </div>
  );
};

export default Ad;