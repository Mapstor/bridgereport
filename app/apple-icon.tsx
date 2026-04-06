import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '32px',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bridge arch */}
          <path
            d="M2 18 C2 18, 6 8, 12 8 C18 8, 22 18, 22 18"
            stroke="white"
            strokeWidth="1.8"
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
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Support pillars */}
          <line x1="6" y1="18" x2="6" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="18" y1="18" x2="18" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          {/* Vertical cables/supports */}
          <line x1="9" y1="11" x2="9" y2="18" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="8" x2="12" y2="18" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="15" y1="11" x2="15" y2="18" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
