'use client';

import dynamic from 'next/dynamic';

// Loading skeleton
function MapSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center bg-slate-100 rounded-lg animate-pulse"
      style={{ height }}
    >
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500">Loading 623,000+ bridges...</p>
    </div>
  );
}

// Dynamic import with ssr: false is allowed in client components
const NationalBridgeMap = dynamic(() => import('@/components/NationalBridgeMap'), {
  ssr: false,
  loading: () => <MapSkeleton height={500} />,
});

interface NationalBridgeMapWrapperProps {
  height?: number;
}

export default function NationalBridgeMapWrapper({ height = 500 }: NationalBridgeMapWrapperProps) {
  return <NationalBridgeMap height={height} />;
}
