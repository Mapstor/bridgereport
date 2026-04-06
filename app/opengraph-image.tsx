import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const alt = 'BridgeReport.org - America\'s 623,218 Highway Bridges';

// Image generation
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Bridge icon */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 40 }}
        >
          {/* Bridge arch */}
          <path
            d="M2 18 C2 18, 6 8, 12 8 C18 8, 22 18, 22 18"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bridge deck */}
          <line
            x1="2"
            y1="18"
            x2="22"
            y2="18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Support pillars */}
          <line x1="6" y1="18" x2="6" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="18" x2="18" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {/* Vertical cables/supports */}
          <line x1="9" y1="11" x2="9" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" />
          <line x1="12" y1="8" x2="12" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" />
          <line x1="15" y1="11" x2="15" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" />
        </svg>

        {/* Site name */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 20 }}>
          <span style={{ fontSize: 72, fontWeight: 700, color: 'white' }}>BridgeReport</span>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#60a5fa' }}>.org</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Explore condition data for America&apos;s 623,218 highway bridges
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
