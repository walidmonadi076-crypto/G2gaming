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

  if (!html) return null;

  // SSR and Initial Hydration: Render a placeholder with zero attributes to ensure match
  if (!isMounted) {
      return <div className={className} />;
  }

  return (
    <div 
      className={`
        prose prose-invert max-w-none 
        prose-p:text-gray-400 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
        prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
        prose-h2:text-3xl prose-h2:italic prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
        prose-strong:text-purple-400 prose-strong:font-bold
        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-gray-400 prose-ul:space-y-2
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-gray-400 prose-ol:space-y-2
        prose-li:text-lg
        prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300 hover:prose-a:underline font-bold
        prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-10
        prose-blockquote:border-l-4 prose-blockquote:border-purple-600 prose-blockquote:bg-purple-900/10 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-xl
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning={true}
    />
  );
};

export default HtmlContent;