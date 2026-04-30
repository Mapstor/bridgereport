import { NextResponse } from 'next/server';
import { getCityBySlug } from '@/lib/data';

// Cache for 24h. City bridge lists change only when NBI data is regenerated.
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ state: string; slug: string }> },
) {
  const { state, slug } = await params;
  const city = getCityBySlug(state, slug);
  if (!city) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }
  return NextResponse.json(
    { bridges: city.bridges, total: city.bridges.length },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
  );
}
