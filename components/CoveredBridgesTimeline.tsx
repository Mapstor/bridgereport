import Link from 'next/link';
import type { CoveredBridgeSummary } from '@/lib/data';

interface CoveredBridgesTimelineProps {
  bridges: CoveredBridgeSummary[];
  count?: number;
}

// Use fixed year to avoid hydration mismatch
const CURRENT_YEAR = 2026;

export default function CoveredBridgesTimeline({ bridges, count = 10 }: CoveredBridgesTimelineProps) {
  const topBridges = bridges.filter(b => b.yearBuilt).slice(0, count);
  const oldestYear = topBridges[0]?.yearBuilt || 1800;
  const newestYear = topBridges[topBridges.length - 1]?.yearBuilt || 1900;
  const timelineRange = newestYear - oldestYear || 1;

  return (
    <div className="space-y-4">
      {topBridges.map((bridge, index) => {
        const age = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : null;
        const position = bridge.yearBuilt
          ? ((bridge.yearBuilt - oldestYear) / timelineRange) * 100
          : 0;

        return (
          <div key={bridge.structureNumber} className="relative">
            <div className="flex items-start gap-4">
              {/* Rank and Year */}
              <div className="w-20 shrink-0 text-right">
                <span className="text-sm font-mono text-slate-400">#{index + 1}</span>
                <p className="text-lg font-bold text-amber-700">{bridge.yearBuilt}</p>
              </div>

              {/* Timeline dot */}
              <div className="relative flex flex-col items-center">
                <div className="w-4 h-4 bg-amber-600 rounded-full border-2 border-white shadow"></div>
                {index < topBridges.length - 1 && (
                  <div className="w-0.5 h-16 bg-amber-200"></div>
                )}
              </div>

              {/* Bridge Info */}
              <div className="flex-1 pb-4">
                <Link
                  href={`/bridge/${bridge.state.toLowerCase()}/${encodeURIComponent(bridge.structureNumber)}`}
                  className="text-base font-semibold text-slate-900 hover:text-amber-700 transition-colors"
                >
                  {bridge.facilityCarried || 'Unknown Road'}
                </Link>
                <p className="text-sm text-slate-600">
                  over {bridge.featuresIntersected || 'Unknown'}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                    {age} years old
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">
                    {bridge.countyName}, {bridge.stateName}
                  </span>
                  {bridge.historical === '1' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
                      NRHP Listed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
