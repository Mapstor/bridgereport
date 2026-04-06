/**
 * Sitemap Index - Points to all sub-sitemaps
 * GET /sitemap-index.xml
 */

import { NextResponse } from 'next/server';
import { getAllStateAbbrs } from '@/lib/data';

const BASE_URL = 'https://bridgereport.org';

export async function GET() {
  const states = getAllStateAbbrs();

  const sitemaps = [
    // Core sitemaps
    `${BASE_URL}/sitemap-states.xml`,
    `${BASE_URL}/sitemap-counties.xml`,
    `${BASE_URL}/sitemap-cities.xml`,
    `${BASE_URL}/sitemap-rankings.xml`,
    // Per-state bridge sitemaps (one per state to stay under 50K limit)
    ...states.map((state) => `${BASE_URL}/sitemap/bridges/${state.toLowerCase()}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((url) => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
