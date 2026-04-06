'use client';

import dynamic from 'next/dynamic';
import type { CoveredBridgeSummary } from '@/lib/data';

const CoveredBridgesMap = dynamic(() => import('./CoveredBridgesMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-slate-100 rounded-xl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface CoveredBridgesMapWrapperProps {
  bridges: CoveredBridgeSummary[];
  height?: number;
}

export default function CoveredBridgesMapWrapper({ bridges, height = 500 }: CoveredBridgesMapWrapperProps) {
  return <CoveredBridgesMap bridges={bridges} height={height} />;
}
