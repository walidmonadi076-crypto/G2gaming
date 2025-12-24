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
      // This is crucial: Server renders empty, client only injects after mount.
      // This guarantees zero mismatch errors for HTML strings.
      dangerouslySetInnerHTML={{ __html: isMounted ? html : '' }}
    />
  );
};

export default HtmlContent;