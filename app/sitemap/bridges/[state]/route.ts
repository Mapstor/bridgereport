/**
 * Per-State Bridge Sitemap - All bridges for a specific state
 * GET /sitemap/bridges/{state} (e.g., /sitemap/bridges/tx)
 *
 * Split by state to stay under sitemap 50K URL limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBridgeIdsForState, getAllStateAbbrs } from '@/lib/data';

const BASE_URL = 'https://bridgereport.org';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ state: string }> }
) {
  const { state } = await params;
  const stateAbbr = state.toUpperCase();

  // Validate state
  const allStates = getAllStateAbbrs();
  if (!allStates.includes(stateAbbr)) {
    return new NextResponse('State not found', { status: 404 });
  }

  const bridgeIds = getBridgeIdsForState(stateAbbr);
  const today = new Date().toISOString().split('T')[0];
  const stateLower = stateAbbr.toLowerCase();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${bridgeIds
  .map(
    (id) => `  <url>
    <loc>${BASE_URL}/bridge/${stateLower}/${encodeURIComponent(id)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
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

// Generate static params for all states (enables static generation)
export async function generateStaticParams() {
  const states = getAllStateAbbrs();
  return states.map((state) => ({
    state: state.toLowerCase(),
  }));
}
