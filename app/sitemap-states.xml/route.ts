/**
 * States Sitemap - All 54 state/territory pages
 * GET /sitemap-states.xml
 */

import { NextResponse } from 'next/server';
import { getSitemapStates } from '@/lib/data';

const BASE_URL = 'https://bridgereport.org';

export async function GET() {
  const states = getSitemapStates();
  const today = new Date().toISOString().split('T')[0];

  // Homepage
  const urls = [
    {
      loc: BASE_URL,
      priority: '1.0',
      changefreq: 'daily',
    },
  ];

  // State pages
  for (const s of states) {
    urls.push({
      loc: `${BASE_URL}/state/${s.state.toLowerCase()}`,
      priority: '0.9',
      changefreq: 'weekly',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
