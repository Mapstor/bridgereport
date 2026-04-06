import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#1e3a5f',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bridge arch */}
          <path
            d="M2 18 C2 18, 6 8, 12 8 C18 8, 22 18, 22 18"
            stroke="white"
            strokeWidth="2"
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
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Support pillars */}
          <line x1="6" y1="18" x2="6" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="18" x2="18" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* Vertical cables/supports */}
          <line x1="9" y1="11" x2="9" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="8" x2="12" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="11" x2="15" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
