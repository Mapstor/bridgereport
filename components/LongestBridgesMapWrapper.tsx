'use client';

import dynamic from 'next/dynamic';
import type { RankingBridge } from '@/types';

const LongestBridgesMap = dynamic(() => import('./LongestBridgesMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-slate-100 rounded-xl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface LongestBridgesMapWrapperProps {
  bridges: RankingBridge[];
  height?: number;
}

export default function LongestBridgesMapWrapper({ bridges, height = 500 }: LongestBridgesMapWrapperProps) {
  return <LongestBridgesMap bridges={bridges} height={height} />;
}
