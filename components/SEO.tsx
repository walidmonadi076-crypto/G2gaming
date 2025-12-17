import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string[];
  schema?: Record<string, any>;
  // FIX: Added noindex prop to allow pages to opt-out of search engine indexing.
  noindex?: boolean;
  // FIX: Added optional children to satisfy strict type checks when used as a component.
  children?: React.ReactNode;
}

export default function SEO({
  title = 'G2gaming - Download Free Games, Guides & Gear',
  description = 'Your ultimate destination for free downloadable games, expert gaming guides and techniques, and top-quality gear to enhance your gameplay. G2gaming has everything you need to level up.',
  image = 'https://picsum.photos/seed/ogimage/1200/630',
  url = '',
  keywords = ['G2gaming', 'download games', 'free games', 'pc games', 'gaming guides', 'gaming tips', 'gaming techniques', 'gaming gear', 'gaming accessories', 'gaming products'],
  schema,
  noindex,
  children,
}: SEOProps) {
  const fullTitle = title.includes('G2gaming') ? title : `${title} | G2gaming`;
  const fullUrl = url ? `https://yoursite.com${url}` : 'https://yoursite.com';

  return (
    /* FIX: Using explicit children prop for Head to resolve type resolution issues with JSX children in some environments. */
    <Head
      children={
        <>
          <title>{fullTitle}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords.join(', ')} />

          {/* FIX: Conditionally render the 'noindex' meta tag for search engines. */}
          {noindex && <meta name="robots" content="noindex, nofollow" />}

          <meta property="og:title" content={fullTitle} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={image} />
          <meta property="og:url" content={fullUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="G2gaming" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={fullTitle} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={image} />

          <meta name="theme-color" content="#7c3aed" />
          <link rel="canonical" href={fullUrl} />

          <link rel="icon" href="/favicon.ico" />

          {schema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          )}
          {children}
        </>
      }
    />
  );
}
