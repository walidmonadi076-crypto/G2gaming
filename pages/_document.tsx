import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

interface MyDocumentProps {
  ogadsScriptBlock: string | null;
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    let ogadsScriptBlock: string | null = null;
    
    try {
      // Use the internal host for server-side fetching, or fallback for local dev
      const host = ctx.req?.headers.host || 'localhost:5000';
      const protocol = host.startsWith('localhost') ? 'http' : 'https';
      const res = await fetch(`${protocol}://${host}/api/settings/ogads-script`);

      if (res.ok) {
        const data = await res.json();
        ogadsScriptBlock = data.script; // The API now returns the full script block
      }
    } catch (error) {
      console.error('Failed to fetch OGAds script block:', error);
    }
    
    return { ...initialProps, ogadsScriptBlock };
  }

  render() {
    const { ogadsScriptBlock } = this.props;
    
    return (
      <Html lang="en" className="font-sans">
        <Head>
          <meta charSet="UTF-8" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          
          {/* OGAds Content Locker Script - Injected directly to prevent async issues */}
          {ogadsScriptBlock && (
            <div dangerouslySetInnerHTML={{ __html: ogadsScriptBlock }} />
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
