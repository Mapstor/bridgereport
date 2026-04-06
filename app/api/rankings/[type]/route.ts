import { NextRequest, NextResponse } from 'next/server';
import { getBridgeRanking } from '@/lib/data';

export const dynamic = 'force-dynamic';

const VALID_TYPES = [
  'longest_bridges',
  'oldest_bridges',
  'most_trafficked',
  'worst_condition',
  'longest_span',
  'historic_bridges',
] as const;

type RankingType = typeof VALID_TYPES[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as RankingType)) {
    return NextResponse.json({ error: 'Invalid ranking type' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '100', 10);
  const search = searchParams.get('search') || '';

  // Limit page size to prevent abuse
  const limitedPageSize = Math.min(pageSize, 200);

  const allBridges = getBridgeRanking(type as RankingType);

  // Filter by search if provided
  let filteredBridges = allBridges;
  if (search.trim()) {
    const q = search.toLowerCase();
    filteredBridges = allBridges.filter(b =>
      (b.facilityCarried?.toLowerCase().includes(q)) ||
      (b.featuresIntersected?.toLowerCase().includes(q)) ||
      (b.location?.toLowerCase().includes(q)) ||
      (b.stateName?.toLowerCase().includes(q)) ||
      (b.state?.toLowerCase() === q)
    );
  }

  const total = filteredBridges.length;
  const start = page * limitedPageSize;
  const end = start + limitedPageSize;
  const bridges = filteredBridges.slice(start, end);

  return NextResponse.json({
    bridges,
    total,
    page,
    pageSize: limitedPageSize,
    hasMore: end < total,
  });
}
