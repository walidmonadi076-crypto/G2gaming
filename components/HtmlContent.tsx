
import React from 'react';

interface HtmlContentProps {
  html: string;
  className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ html, className = "" }) => {
  if (!html) return null;

  return (
    <div 
      className={`
        prose prose-invert max-w-none 
        prose-p:text-gray-400 prose-p:leading-relaxed prose-p:mb-4
        prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
        prose-strong:text-purple-400 prose-strong:font-bold
        prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4 prose-ul:text-gray-400
        prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-4 prose-ol:text-gray-400
        prose-li:mb-1
        prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300 hover:prose-a:underline
        prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl
        prose-blockquote:border-l-4 prose-blockquote:border-purple-600 prose-blockquote:bg-purple-900/10 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default HtmlContent;
