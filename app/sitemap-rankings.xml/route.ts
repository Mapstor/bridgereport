/**
 * Rankings & Tools Sitemap - Static pages for rankings and tools
 * GET /sitemap-rankings.xml
 */

import { NextResponse } from 'next/server';
import { getAllStateAbbrs } from '@/lib/data';

const BASE_URL = 'https://www.bridgereport.org';

export async function GET() {
  const states = getAllStateAbbrs();
  const today = new Date().toISOString().split('T')[0];

  // Static ranking pages
  const rankingPages = [
    '/rankings',
    '/longest-bridges',
    '/oldest-bridges',
    '/historic-bridges',
    '/most-trafficked-bridges',
    '/worst-condition-bridges',
    '/longest-span-bridges',
    '/bridges-near-me',
  ];

  // Per-state worst bridges pages
  const worstBridgesPages = states.map(
    (state) => `/worst-bridges/${state.toLowerCase()}`
  );

  const allPages = [...rankingPages, ...worstBridgesPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
