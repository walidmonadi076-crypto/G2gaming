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
      // Render empty on server and hydration, then inject on mount to ensure mismatch is impossible
      dangerouslySetInnerHTML={{ __html: isMounted ? html : '' }}
    />
  );
};

export default HtmlContent;