import { ImageResponse } from 'next/og';
import { getState, formatNumber, formatPct } from '@/lib/data';

export const alt = 'State bridge infrastructure summary';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function StateOgImage({
  params,
}: {
  params: Promise<{ abbr: string }>;
}) {
  const { abbr } = await params;
  const state = getState(abbr);

  if (!state) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: 'white',
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          BridgeReport.org
        </div>
      ),
      size,
    );
  }

  // Color the poor% pill green/yellow/red
  const poor = state.poorPct;
  const poorColor = poor < 5 ? '#16a34a' : poor < 10 ? '#ca8a04' : '#dc2626';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: '#60a5fa', display: 'flex' }}>
            BridgeReport<span style={{ color: 'white' }}>.org</span>
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: 2,
              display: 'flex',
            }}
          >
            State Report
          </div>
        </div>

        {/* Main */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.0,
              marginBottom: 12,
              display: 'flex',
            }}
          >
            {state.stateName}
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#cbd5e1',
              marginBottom: 56,
              display: 'flex',
            }}
          >
            {formatNumber(state.total)} highway bridges
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 56 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'flex' }}>
                Poor Condition
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: poorColor,
                  marginTop: 4,
                  display: 'flex',
                }}
              >
                {formatPct(state.poorPct)}
              </div>
              <div style={{ fontSize: 20, color: '#64748b', marginTop: 4, display: 'flex' }}>
                {formatNumber(state.poor)} bridges
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'flex' }}>
                Good Condition
              </div>
              <div style={{ fontSize: 56, fontWeight: 700, color: '#16a34a', marginTop: 4, display: 'flex' }}>
                {formatPct(state.goodPct)}
              </div>
              <div style={{ fontSize: 20, color: '#64748b', marginTop: 4, display: 'flex' }}>
                {formatNumber(state.good)} bridges
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'flex' }}>
                Avg. Year Built
              </div>
              <div style={{ fontSize: 56, fontWeight: 700, marginTop: 4, display: 'flex' }}>
                {state.avgYearBuilt}
              </div>
              <div style={{ fontSize: 20, color: '#64748b', marginTop: 4, display: 'flex' }}>
                {state.countyCount} counties
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            color: '#64748b',
            fontSize: 18,
            borderTop: '1px solid #334155',
            paddingTop: 16,
            marginTop: 32,
          }}
        >
          National Bridge Inventory · Federal Highway Administration · 2024
        </div>
      </div>
    ),
    size,
  );
}
