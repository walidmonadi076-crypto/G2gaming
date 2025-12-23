import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

export const FAVICON_DATA_URI = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Cdefs%3E%3ClinearGradient%20id='g2-grad'%20x1='0'%20y1='0'%20x2='1'%20y2='1'%3E%3Cstop%20offset='0%25'%20stop-color='%23a855f7'/%3E%3Cstop%20offset='100%25'%20stop-color='%233b82f6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle%20cx='16'%20cy='16'%20r='15'%20fill='url(%23g2-grad)'/%3E%3Ctext%20x='16'%20y='22'%20font-family='Impact,%20sans-serif'%20font-size='18'%20fill='white'%20text-anchor='middle'%3EG2%3C/text%3E%3C/svg%3E";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" suppressHydrationWarning={true}>
        <Head>
          <meta charSet="UTF-8" />
          <link rel="icon" href={FAVICON_DATA_URI} type="image/svg+xml" />
          <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        </Head>
        <body className="bg-[#0d0d0d] antialiased" suppressHydrationWarning={true}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;