/** @type {import('next').NextConfig} */

// Define a comprehensive Content Security Policy to allow ad scripts while maintaining security.
const csp = [
  "default-src 'self'",
  // Allow scripts from any HTTPS source, plus 'unsafe-inline' and 'unsafe-eval' which are often required by ad/analytics scripts.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
  "style-src 'self' 'unsafe-inline'",
  // Allow images and frames from any HTTPS source to accommodate ads and dynamic content.
  "img-src 'self' data: https:",
  "frame-src 'self' https:",
  // Allow connections for Google Analytics.
  "connect-src 'self' https://www.google-analytics.com",
  // Allow media from specific known sources.
  "media-src 'self' https://www.w3schools.com",
  "font-src 'self'",
  // Lock down other directives for better security.
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

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
    // A sensible default that helps prevent referrer leakage while being compatible with ad networks.
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    // Apply the Content Security Policy to allow external ad scripts to load.
    key: 'Content-Security-Policy',
    value: csp.replace(/\s{2,}/g, ' ').trim()
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