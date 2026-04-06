import type { RankingBridge } from '@/types';
import Link from 'next/link';

interface SpanComparisonChartProps {
  bridges: RankingBridge[];
  count?: number;
}

// Get color based on design type
function getDesignColor(design: string | undefined): string {
  if (!design) return '#64748b';
  if (design.includes('Suspension')) return '#7c3aed'; // violet
  if (design.includes('Cable')) return '#2563eb'; // blue
  if (design.includes('Arch')) return '#dc2626'; // red
  if (design.includes('Truss')) return '#059669'; // emerald
  return '#64748b';
}

export default function SpanComparisonChart({ bridges, count = 10 }: SpanComparisonChartProps) {
  const topBridges = bridges.slice(0, count);
  const maxSpan = topBridges[0]?.maxSpanFt || 1;

  return (
    <div className="space-y-3">
      {topBridges.map((bridge, index) => {
        const widthPercent = ((bridge.maxSpanFt || 0) / maxSpan) * 100;
        const color = getDesignColor(bridge.designTypeName);

        return (
          <div key={bridge.id} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-mono text-slate-400 w-6 shrink-0">#{index + 1}</span>
                <Link
                  href={`/bridge/${bridge.state.toLowerCase()}/${bridge.id}`}
                  className="text-sm font-medium text-slate-700 group-hover:text-blue-600 truncate"
                  title={bridge.facilityCarried || 'Unknown'}
                >
                  {bridge.facilityCarried || 'Unknown'}
                </Link>
                <span className="text-xs text-slate-400 shrink-0">{bridge.state}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-semibold text-slate-900">
                  {bridge.maxSpanFt ? Math.round(bridge.maxSpanFt).toLocaleString() : '—'} ft
                </span>
              </div>
            </div>
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                  minWidth: '60px',
                }}
              >
                <span className="text-xs font-medium text-white/90">
                  {bridge.designTypeName?.split(' - ')[0] || ''}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-8">
              over {bridge.featuresIntersected || 'Unknown'}
              {bridge.yearBuilt ? ` · Built ${bridge.yearBuilt}` : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}
