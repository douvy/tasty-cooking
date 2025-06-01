/**
 * @type {import('next').NextConfig}
 * 
 * Security notes:
 * - dangerouslyAllowSVG is enabled to support SVG images in the Next.js Image component
 * - A comprehensive Content-Security-Policy is implemented to mitigate XSS risks:
 *   - SVG content is secured through proper CSP directives
 *   - Inline scripts are restricted to only what Next.js requires
 *   - Object/embed tags are completely disallowed
 *   - Image sources are limited to trusted domains
 *   - form-action and base-uri are restricted to same origin
 */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    // We'll configure plugins in the MDX processing code instead
    providerImportSource: '@mdx-js/react',
  },
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.tasty.cooking'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tasty.cooking https://www.tasty.cooking; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; frame-src 'self'; worker-src 'self'; form-action 'self'; base-uri 'self'; sandbox;",
    minimumCacheTTL: 60,
  },
  env: {
    // Make sure this fallback matches the constant in src/lib/constants.ts
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tasty.cooking',
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          // Comprehensive Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              // Default restrictive policy
              "default-src 'self'",
              // Scripts - only allow from same origin (unsafe-eval needed for Next.js)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles - allow inline styles for Next.js
              "style-src 'self' 'unsafe-inline'",
              // Images - allow from our domain and data URIs (for optimized images)
              "img-src 'self' data: https://*.tasty.cooking https://www.tasty.cooking",
              // Fonts - allow from our origin
              "font-src 'self'",
              // Connect - only allow to our API endpoints
              "connect-src 'self'",
              // Media - allow from our origin
              "media-src 'self'",
              // Object/embed - restrict completely
              "object-src 'none'",
              // Frames - only same origin
              "frame-src 'self'",
              // Strict policy to prevent data theft
              "form-action 'self'",
              // Prevent base tag hijacking
              "base-uri 'self'",
              // Upgrade insecure requests
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Other security headers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ],
      },
    ]
  },
  // We don't need rewrites anymore since we're using the root [slug].tsx pattern
  // But we'll keep this empty function to maintain compatibility
  async rewrites() {
    return [];
  },
}

module.exports = withMDX(nextConfig);