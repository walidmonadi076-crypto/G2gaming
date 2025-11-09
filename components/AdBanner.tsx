"use client";

import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adContainer = adContainerRef.current;
    if (!adContainer) return;

    // Clear any previous content to prevent script duplication on re-renders.
    adContainer.innerHTML = '';

    // Create the inline script that sets up the ad options.
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.async = false; // Important for some ad networks that need config to be present before the main script runs.
    configScript.innerHTML = `
      atOptions = {
        'key' : '01c9172b4dc18ccb8f5b4e7b1b852299',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    // Create the external script that loads the ad logic.
    const externalScript = document.createElement('script');
    externalScript.type = 'text/javascript';
    // Ensure the script source uses https://
    externalScript.src = 'https://www.highperformanceformat.com/01c9172b4dc18ccb8f5b4e7b1b852299/invoke.js';
    externalScript.async = false; // Ensure synchronous-like execution to avoid race conditions.

    // Append the scripts to the container div to trigger their execution.
    adContainer.appendChild(configScript);
    adContainer.appendChild(externalScript);

    // Cleanup function to remove scripts when the component unmounts.
    return () => {
      if (adContainer) {
        adContainer.innerHTML = '';
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once after the initial render.

  return (
    <div 
      ref={adContainerRef} 
      className={className}
      // The ad script will create an iframe with these dimensions.
      // This container helps reserve the space.
      style={{ width: '728px', height: '90px', maxWidth: '100%' }}
    />
  );
};

export default AdBanner;
