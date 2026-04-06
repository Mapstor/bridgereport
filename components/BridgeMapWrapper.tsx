'use client';

import dynamic from 'next/dynamic';
import type { BridgeSlim } from '@/types';

// Loading skeleton
function MapSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center bg-slate-50 rounded-lg animate-pulse"
      style={{ height }}
    >
      <p className="text-slate-400">Loading map...</p>
    </div>
  );
}

// Dynamic import with ssr: false is allowed in client components
const BridgeMap = dynamic(() => import('@/components/BridgeMap'), {
  ssr: false,
  loading: () => <MapSkeleton height={400} />,
});

interface BridgeMapWrapperProps {
  bridges: BridgeSlim[];
  state: string;
  height?: number;
}

export default function BridgeMapWrapper({ bridges, state, height = 400 }: BridgeMapWrapperProps) {
  return <BridgeMap bridges={bridges} state={state} height={height} />;
}
