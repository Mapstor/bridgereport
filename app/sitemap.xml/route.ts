/**
 * Main Sitemap - All live pages (excludes individual bridge pages)
 * GET /sitemap.xml
 *
 * Priority structure:
 * - 1.0: Homepage
 * - 0.9: Rankings hub + State pages
 * - 0.8: Ranking list pages
 * - 0.7: Utility/info pages
 */

import { NextResponse } from 'next/server';
import { getSitemapStates, getAllStateAbbrs } from '@/lib/data';

const BASE_URL = 'https://www.bridgereport.org';

interface SitemapUrl {
  loc: string;
  priority: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
}

export async function GET() {
  const states = getSitemapStates();
  const stateAbbrs = getAllStateAbbrs();
  const today = new Date().toISOString().split('T')[0];

  const urls: SitemapUrl[] = [];

  // Priority 1.0: Homepage
  urls.push({
    loc: BASE_URL,
    priority: '1.0',
    changefreq: 'daily',
  });

  // Priority 0.9: Rankings hub page
  urls.push({
    loc: `${BASE_URL}/rankings`,
    priority: '0.9',
    changefreq: 'weekly',
  });

  // Priority 0.9: All state/territory pages (55 total)
  for (const s of states) {
    urls.push({
      loc: `${BASE_URL}/state/${s.state.toLowerCase()}`,
      priority: '0.9',
      changefreq: 'weekly',
    });
  }

  // Priority 0.8: Ranking list pages
  const rankingPages = [
    '/longest-bridges',
    '/oldest-bridges',
    '/covered-bridges',
    '/historic-bridges',
    '/longest-span-bridges',
    '/most-trafficked-bridges',
    '/worst-condition-bridges',
    '/bridges-near-me',
  ];

  for (const page of rankingPages) {
    urls.push({
      loc: `${BASE_URL}${page}`,
      priority: '0.8',
      changefreq: 'weekly',
    });
  }

  // Priority 0.8: Per-state worst bridges pages
  for (const state of stateAbbrs) {
    urls.push({
      loc: `${BASE_URL}/worst-bridges/${state.toLowerCase()}`,
      priority: '0.8',
      changefreq: 'weekly',
    });
  }

  // Priority 0.8: Per-state covered bridges pages
  for (const state of stateAbbrs) {
    urls.push({
      loc: `${BASE_URL}/covered-bridges/${state.toLowerCase()}`,
      priority: '0.8',
      changefreq: 'weekly',
    });
  }

  // Priority 0.7: Utility/info pages
  const utilityPages = [
    '/methodology',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ];

  for (const page of utilityPages) {
    urls.push({
      loc: `${BASE_URL}${page}`,
      priority: '0.7',
      changefreq: 'monthly',
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
