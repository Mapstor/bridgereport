/**
 * Cities Sitemap - All city pages
 * GET /sitemap-cities.xml
 */

import { NextResponse } from 'next/server';
import { getAllCitySlugs } from '@/lib/data';

const BASE_URL = 'https://www.bridgereport.org';

export async function GET() {
  const cities = getAllCitySlugs();
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cities
  .map(
    (city) => `  <url>
    <loc>${BASE_URL}/city/${city.state}/${city.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
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
