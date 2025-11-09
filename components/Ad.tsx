import React, { useEffect, useRef } from 'react';
import { useAds } from '../contexts/AdContext';

interface AdProps {
  placement: 'game_vertical' | 'game_horizontal' | 'shop_square' | 'blog_skyscraper_left' | 'blog_skyscraper_right';
}

const Ad: React.FC<AdProps> = ({ placement }) => {
  const { ads, isLoading } = useAds();
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  const ad = ads.find(a => a.placement === placement);

  const getAdDimensions = () => {
    switch (placement) {
      case 'game_vertical':
        return { width: 300, height: 600, text: 'Vertical Ad (300x600)' };
      case 'game_horizontal':
        return { width: 728, height: 90, text: 'Horizontal Ad (728x90)' };
      case 'shop_square':
        return { width: 300, height: 250, text: 'Square Ad (300x250)' };
      case 'blog_skyscraper_left':
      case 'blog_skyscraper_right':
        return { width: 160, height: 600, text: 'Skyscraper Ad (160x600)' };
      default:
        return { width: 300, height: 250, text: 'Ad Placeholder' };
    }
  };

  const { width, height, text } = getAdDimensions();

  useEffect(() => {
    const container = adContainerRef.current;
    if (!container || !ad?.code) {
      return;
    }

    // Set the innerHTML, which creates the necessary DOM nodes (like the ad's target div)
    // but does not execute the script tags for security reasons.
    container.innerHTML = ad.code;

    // Find the inert script tags that were just added.
    const scripts = Array.from(container.getElementsByTagName('script'));
    
    scripts.forEach(oldScript => {
      // To execute a script, a new script element must be created and added to the DOM.
      const newScript = document.createElement('script');
      
      // Copy all attributes from the original script to the new one (e.g., src, data attributes).
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Set async to false. Dynamically added scripts are async by default.
      // Some ad scripts may depend on a more sequential execution order.
      newScript.async = false;
      
      // Copy the inline script content.
      newScript.text = oldScript.text;
      
      // Replace the old, non-executable script with the new, executable one.
      // This ensures it runs in the correct place within the ad snippet's structure.
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Cleanup function to remove ad content when the component unmounts or ad code changes.
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [ad?.code]); // Re-run this effect only when the ad code changes.

  const adDimensionsStyle = { width: `${width}px`, height: `${height}px`, maxWidth: '100%' };

  // Display a loading placeholder while fetching ads.
  if (isLoading) {
    return (
      <div 
        style={adDimensionsStyle} 
        className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center animate-pulse"
      >
        <span className="text-gray-500 text-sm font-semibold">Loading Ad...</span>
      </div>
    );
  }

  // If there's no ad code for this placement, show a static placeholder.
  if (!ad || !ad.code) {
    return (
       <div 
        style={adDimensionsStyle} 
        className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"
      >
        <span className="text-gray-500 text-sm font-semibold">{text}</span>
      </div>
    );
  }
  
  // Render the container that the useEffect will populate with the executable ad code.
  return <div ref={adContainerRef} style={adDimensionsStyle} />;
};

export default Ad;
