import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build (faster builds)
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },

  // Skip ESLint during build (faster builds)
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_LINT === 'true',
  },

  // 301 redirect bare domain → www (safety net — Vercel handles this at edge,
  // but this catches any requests that slip through)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'bridgereport.org' }],
        destination: 'https://www.bridgereport.org/:path*',
        permanent: true,
      },
    ];
  },

  // Caching headers for optimal performance
  async headers() {
    return [
      {
        // Static assets in _next/static (immutable)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // JSON data files (spatial index, etc.)
        source: '/spatial-index.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Sitemaps
        source: '/sitemap-index.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        // Per-state sitemaps
        source: '/sitemap/bridges/:state',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        // API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Ensure data files are included in all serverless function bundles
  // (needed for getMinimalBridge() which reads state JSONs from bridge detail routes,
  // and for city pages which read place names + per-city bridge JSONs)
  outputFileTracingIncludes: {
    '/bridge/[state]/[id]': ['./data/states/**/*.json', './data/rankings/**/*.json'],
    // Per-state city index (53 files) instead of per-city files (21K files) — 21K files
    // exceeded Vercel's tracing capacity and silently dropped from the bundle. Built by
    // scripts/build-cities-index.js as a prebuild step.
    '/city/[state]/[slug]': ['./data/cities-index/**/*.json', './data/meta/**/*.json'],
    '/sitemap-cities.xml': ['./data/cities-index/**/*.json', './data/meta/**/*.json'],
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // Compress responses
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Powered by header (disable for security)
  poweredByHeader: false,
};

export default nextConfig;
