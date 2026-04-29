import { ImageResponse } from 'next/og';
import { getBridge, getMinimalBridge, formatNumber } from '@/lib/data';

export const alt = 'Bridge inspection details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 86400;

const COND_COLORS: Record<string, string> = {
  good: '#16a34a',
  fair: '#ca8a04',
  poor: '#dc2626',
};

export default async function BridgeOgImage({
  params,
}: {
  params: Promise<{ state: string; id: string }>;
}) {
  const { state, id } = await params;
  const bridge =
    getBridge(state.toUpperCase(), id) || getMinimalBridge(state.toUpperCase(), id);

  // Fallback for unknown bridges
  if (!bridge) {
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

  const facility = bridge.facilityCarried || 'Bridge';
  const features = bridge.featuresIntersected || '';
  const condition = (bridge.conditionCategory || '').toLowerCase();
  const condColor = COND_COLORS[condition] || '#475569';
  const condLabel = condition ? condition.charAt(0).toUpperCase() + condition.slice(1) : 'Unknown';

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
        {/* Header strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
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
            {bridge.stateName}
          </div>
        </div>

        {/* Main content */}
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
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: 16,
              display: 'flex',
            }}
          >
            {facility.length > 50 ? facility.slice(0, 50) + '…' : facility}
          </div>
          {features && (
            <div
              style={{
                fontSize: 32,
                color: '#cbd5e1',
                marginBottom: 40,
                display: 'flex',
              }}
            >
              over {features.length > 60 ? features.slice(0, 60) + '…' : features}
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 48, marginTop: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'flex' }}>
                Condition
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: condColor,
                  marginTop: 4,
                  display: 'flex',
                }}
              >
                {condLabel}
              </div>
            </div>
            {bridge.yearBuilt && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'flex' }}>
                  Year Built
                </div>
                <div style={{ fontSize: 40, fontWeight: 700, marginTop: 4, display: 'flex' }}>
                  {bridge.yearBuilt}
                </div>
              </div>
            )}
            {bridge.adt && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'flex' }}>
                  Daily Traffic
                </div>
                <div style={{ fontSize: 40, fontWeight: 700, marginTop: 4, display: 'flex' }}>
                  {formatNumber(bridge.adt)}
                </div>
              </div>
            )}
            {bridge.lengthFt && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'flex' }}>
                  Length
                </div>
                <div style={{ fontSize: 40, fontWeight: 700, marginTop: 4, display: 'flex' }}>
                  {formatNumber(Math.round(bridge.lengthFt))} ft
                </div>
              </div>
            )}
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
          National Bridge Inventory · Federal Highway Administration
        </div>
      </div>
    ),
    size,
  );
}
