import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
  noindex?: boolean;
  children?: React.ReactNode;
}

export default function SEO({
  title = 'G2gaming - Download Free Games',
  description = 'Your destination for free games.',
  image = 'https://picsum.photos/seed/ogimage/1200/630',
  url = '',
  keywords = ['G2gaming', 'download games'],
  noindex,
  children,
}: SEOProps) {
  const fullTitle = title.includes('G2gaming') ? title : `${title} | G2gaming`;
  return (
    <Head
      children={
        <>
          <title>{fullTitle}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords.join(', ')} />
          {noindex && <meta name="robots" content="noindex, nofollow" />}
          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={image} />
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="canonical" href={`https://g2gaming.vercel.app${url}`} />
          {children}
        </>
      }
    />
  );
}