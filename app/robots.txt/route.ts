/**
 * robots.txt - Search engine crawler directives
 * GET /robots.txt
 */

import { NextResponse } from 'next/server';

const BASE_URL = 'https://bridgereport.org';

export async function GET() {
  const robotsTxt = `# BridgeReport.org robots.txt
# https://bridgereport.org

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap-index.xml

# Crawl-delay for polite crawling
Crawl-delay: 1

# Block common non-content paths
Disallow: /api/
Disallow: /_next/
Disallow: /static/
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
