/**
 * robots.txt - Search engine crawler directives
 * GET /robots.txt
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `# BridgeReport.org robots.txt
# Canonical domain: https://www.bridgereport.org

User-agent: *
Allow: /

# Main Sitemap
Sitemap: https://www.bridgereport.org/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 1

# Block non-content paths
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /embed/
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
