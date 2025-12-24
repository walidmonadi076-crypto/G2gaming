import React, { useState, useEffect } from 'react';

interface HtmlContentProps {
  html: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ html, className = "" }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      // Extra safety: we render nothing during the hydration phase.
      // Once isMounted is true (client-side only), the HTML is safely injected.
      dangerouslySetInnerHTML={{ __html: isMounted ? html : '' }}
      suppressHydrationWarning
    />
  );
};

export default HtmlContent;