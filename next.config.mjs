/** @type {import('next').NextConfig} */

// A more specific CSP to enhance security
const ContentSecurityPolicy = `
  frame-ancestors 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com *;
  frame-src 'self' https://www.google.com *;
  connect-src 'self' *;
  img-src 'self' data: https://picsum.photos https://i.pravatar.cc *;
  style-src 'self' 'unsafe-inline' *;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Referrer-Policy',
    value: 'no-referrer-when-downgrade',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  }
];


const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Cache pour les API publiques (tout sauf admin, auth, etc.)
        source: '/api/((?!admin|auth|migrate-data|test-db).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
        ],
      },
      {
        // Désactivation du cache pour les API sensibles
        source: '/api/(admin|auth|migrate-data|test-db)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;