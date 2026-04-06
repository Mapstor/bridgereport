'use client';

import dynamic from 'next/dynamic';
import type { RankingBridge } from '@/types';

const TraffickedBridgesMap = dynamic(() => import('./TraffickedBridgesMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-slate-100 rounded-xl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface TraffickedBridgesMapWrapperProps {
  bridges: RankingBridge[];
  height?: number;
}

export default function TraffickedBridgesMapWrapper({ bridges, height = 500 }: TraffickedBridgesMapWrapperProps) {
  return <TraffickedBridgesMap bridges={bridges} height={height} />;
}
