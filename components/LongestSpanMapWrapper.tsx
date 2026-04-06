'use client';

import dynamic from 'next/dynamic';
import type { RankingBridge } from '@/types';

const LongestSpanMap = dynamic(() => import('./LongestSpanMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-slate-100 rounded-xl">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface LongestSpanMapWrapperProps {
  bridges: RankingBridge[];
  height?: number;
}

export default function LongestSpanMapWrapper({ bridges, height = 500 }: LongestSpanMapWrapperProps) {
  return <LongestSpanMap bridges={bridges} height={height} />;
}
