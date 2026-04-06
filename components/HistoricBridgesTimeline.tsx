import type { RankingBridge } from '@/types';
import Link from 'next/link';

interface HistoricBridgesTimelineProps {
  bridges: RankingBridge[];
  count?: number;
}

export default function HistoricBridgesTimeline({ bridges, count = 10 }: HistoricBridgesTimelineProps) {
  // Get oldest bridges
  const oldestBridges = bridges
    .filter(b => b.yearBuilt)
    .sort((a, b) => (a.yearBuilt || 0) - (b.yearBuilt || 0))
    .slice(0, count);

  const minYear = oldestBridges[0]?.yearBuilt || 1800;
  const maxYear = oldestBridges[oldestBridges.length - 1]?.yearBuilt || 1900;
  const yearRange = maxYear - minYear || 1;

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200"></div>

      <div className="space-y-4">
        {oldestBridges.map((bridge, index) => {
          const age = bridge.yearBuilt ? 2026 - bridge.yearBuilt : null;

          return (
            <div key={bridge.id} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-2 top-2 w-5 h-5 rounded-full bg-amber-500 border-4 border-amber-100 shadow"></div>

              <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-amber-600">{bridge.yearBuilt}</span>
                      <span className="text-sm text-slate-400">({age} years old)</span>
                    </div>
                    <Link
                      href={`/bridge/${bridge.state.toLowerCase()}/${bridge.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-blue-600 line-clamp-1"
                    >
                      {bridge.facilityCarried || 'Unknown'}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      over {bridge.featuresIntersected || 'Unknown'}
                      {bridge.location ? ` · ${bridge.location}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-slate-200 text-slate-700">
                      {bridge.state}
                    </span>
                    {bridge.materialName && (
                      <p className="text-xs text-slate-400 mt-1">{bridge.materialName}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
