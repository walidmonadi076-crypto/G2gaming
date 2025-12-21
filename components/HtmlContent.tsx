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

  // Return a stable, empty container for both server and initial client render
  // This is the only way to perfectly satisfy React's hydration check for dynamic HTML
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