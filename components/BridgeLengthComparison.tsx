import type { RankingBridge } from '@/types';

interface BridgeLengthComparisonProps {
  bridges: RankingBridge[];
  count?: number;
}

export default function BridgeLengthComparison({ bridges, count = 10 }: BridgeLengthComparisonProps) {
  const topBridges = bridges.slice(0, count);
  const maxLength = topBridges[0]?.lengthFt || 1;

  // Colors for bars
  const colors = [
    '#7c3aed', // violet
    '#2563eb', // blue
    '#0891b2', // cyan
    '#059669', // emerald
    '#65a30d', // lime
    '#ca8a04', // yellow
    '#ea580c', // orange
    '#dc2626', // red
    '#db2777', // pink
    '#9333ea', // purple
  ];

  return (
    <div className="space-y-3">
      {topBridges.map((bridge, index) => {
        const widthPercent = ((bridge.lengthFt || 0) / maxLength) * 100;
        const miles = bridge.lengthFt ? (bridge.lengthFt / 5280).toFixed(1) : '0';
        const color = colors[index % colors.length];

        return (
          <div key={bridge.id} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-mono text-slate-400 w-6 shrink-0">#{index + 1}</span>
                <a
                  href={`/bridge/${bridge.state.toLowerCase()}/${bridge.id}`}
                  className="text-sm font-medium text-slate-700 group-hover:text-blue-600 truncate"
                  title={bridge.facilityCarried || 'Unknown'}
                >
                  {bridge.facilityCarried || 'Unknown'}
                </a>
                <span className="text-xs text-slate-400 shrink-0">{bridge.state}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-sm font-semibold text-slate-900">
                  {bridge.lengthFt?.toLocaleString()} ft
                </span>
                <span className="text-xs text-slate-400 ml-1">
                  ({miles} mi)
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
                {widthPercent > 15 && (
                  <span className="text-xs font-medium text-white/90">
                    {miles} mi
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
