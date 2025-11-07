import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

interface MyDocumentProps {
  ogadsScriptSrc: string | null;
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    let ogadsScriptSrc: string | null = null;
    
    try {
      // Use the internal host for server-side fetching, or fallback for local dev
      const host = ctx.req?.headers.host || 'localhost:5000';
      const protocol = host.startsWith('localhost') ? 'http' : 'https';
      const res = await fetch(`${protocol}://${host}/api/settings/ogads-script`);

      if (res.ok) {
        const data = await res.json();
        ogadsScriptSrc = data.src;
      }
    } catch (error) {
      console.error('Failed to fetch OGAds script src:', error);
    }
    
    return { ...initialProps, ogadsScriptSrc };
  }

  render() {
    const { ogadsScriptSrc } = this.props;
    
    return (
      <Html lang="en" className="font-sans">
        <Head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          
          {/* OGAds Content Locker Script - Loaded dynamically */}
          <noscript><meta httpEquiv="refresh" content="0;url=https://redirectapps.online/noscript" /></noscript>
          {ogadsScriptSrc && (
            <script type="text/javascript" id="ogjs" src={ogadsScriptSrc} async></script>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;