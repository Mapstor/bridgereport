import type { RankingBridge } from '@/types';
import Link from 'next/link';

interface TrafficComparisonChartProps {
  bridges: RankingBridge[];
  count?: number;
}

export default function TrafficComparisonChart({ bridges, count = 10 }: TrafficComparisonChartProps) {
  const topBridges = bridges.slice(0, count);
  const maxAdt = topBridges[0]?.adt || 1;

  const colors = [
    '#dc2626', // red
    '#ea580c', // orange
    '#d97706', // amber
    '#ca8a04', // yellow
    '#65a30d', // lime
    '#16a34a', // green
    '#0891b2', // cyan
    '#2563eb', // blue
    '#7c3aed', // violet
    '#c026d3', // fuchsia
  ];

  return (
    <div className="space-y-3">
      {topBridges.map((bridge, index) => {
        const widthPercent = ((bridge.adt || 0) / maxAdt) * 100;
        const color = colors[index % colors.length];

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
                  {bridge.adt?.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ml-1">
                  /day
                </span>
              </div>
            </div>
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                  minWidth: '40px',
                }}
              >
                {widthPercent > 20 && (
                  <span className="text-xs font-medium text-white/90">
                    {((bridge.adt || 0) / 1000).toFixed(0)}k
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-8">
              over {bridge.featuresIntersected || 'Unknown'}
              {bridge.location ? ` · ${bridge.location}` : ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}
