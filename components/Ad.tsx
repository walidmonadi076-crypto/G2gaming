"use client";

import React, { useEffect, useRef, useState } from 'react';
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

  const adFromContext = ads.find(a => a.placement === placement);
  const codeToRender = overrideCode !== undefined ? overrideCode : adFromContext?.code;

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
      } catch (err) {}
    }
  }, [isMounted, codeToRender, placement]);

  // SSR must match the initial client frame perfectly
  if (!isMounted) {
    return <div className={`min-h-[90px] ${className}`} suppressHydrationWarning={true} />;
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-xl bg-gray-900/40 border border-white/5 ${className}`} suppressHydrationWarning={true}>
      {showLabel && (
        <span className="absolute top-0 left-0 bg-gray-800/90 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-br-lg uppercase tracking-widest z-10">
          Ad
        </span>
      )}
      <div className="w-full flex justify-center items-center overflow-hidden min-h-[90px]">
        {isLoading ? (
          <div className="animate-pulse bg-white/5 rounded-lg w-full h-[90px]" />
        ) : (
          <div ref={slotRef} className="w-full h-full flex justify-center items-center" />
        )}
      </div>
    </div>
  );
};

export default Ad;