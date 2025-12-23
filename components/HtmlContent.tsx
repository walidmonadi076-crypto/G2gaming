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

  // Critical: SSR must render an identical empty container to the first client frame.
  if (!isMounted || !html) {
    return <div className={className} suppressHydrationWarning={true} />;
  }

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning={true}
    />
  );
};

export default HtmlContent;