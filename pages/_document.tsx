import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';
import { getSiteSettings } from '../lib/data';

// Centralized Favicon Data URI to avoid 404s
export const FAVICON_DATA_URI = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Cdefs%3E%3ClinearGradient%20id='g2-grad'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0%25'%20stop-color='%23a855f7'/%3E%3Cstop%20offset='100%25'%20stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle%20cx='16'%20cy='16'%20r='15'%20fill='url(%23g2-grad)'/%3E%3Ctext%20x='16'%20y='22'%20font-family='Impact,%20sans-serif'%20font-size='18'%20fill='white'%20text-anchor='middle'%3EG2%3C/text%3E%3C/svg%3E";

interface MyDocumentProps extends DocumentInitialProps {
  ogadsScriptUrl: string | null;
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx);
    try {
      const settings = await getSiteSettings();
      let scriptUrl: string | null = null;

      if (settings.ogads_script_src) {
        const srcMatch = settings.ogads_script_src.match(/src=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
          scriptUrl = srcMatch[1];
        }
      }

      return { 
        ...initialProps,
        ogadsScriptUrl: scriptUrl,
      };
    } catch (error) {
      console.error('Failed to fetch site settings in _document:', error);
      return { 
        ...initialProps,
        ogadsScriptUrl: null,
      };
    }
  }

  render() {
    const { ogadsScriptUrl } = (this as any).props;
    
    return (
      <Html lang="en" className="font-sans" suppressHydrationWarning={true}>
        <Head>
          <meta charSet="UTF-8" />
          {/* Use Data URI directly to satisfy browser and avoid 404 /favicon.ico */}
          <link rel="icon" href={FAVICON_DATA_URI} type="image/svg+xml" />
          <meta name="theme-color" content="#ffffff" />
          {ogadsScriptUrl && (
            <script
              id="ogjs"
              type="text/javascript"
              src={ogadsScriptUrl}
            />
          )}
          <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        </Head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                  function getInitialTheme() {
                      try {
                          const storedTheme = window.localStorage.getItem('theme');
                          if (storedTheme) return storedTheme;
                          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      } catch (e) {
                          return 'dark';
                      }
                  }
                  const theme = getInitialTheme();
                  if (theme === 'light') {
                      document.documentElement.classList.add('light');
                  }
              })();
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;