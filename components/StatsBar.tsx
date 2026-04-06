import { formatNumber, formatPct } from '@/lib/data';

interface StatItem {
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'default' | 'green' | 'yellow' | 'red' | 'blue';
}

interface StatsBarProps {
  stats: StatItem[];
  variant?: 'default' | 'compact';
}

const colorClasses = {
  default: 'text-slate-900',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
};

export default function StatsBar({ stats, variant = 'default' }: StatsBarProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-baseline gap-1.5">
            <span className={`font-mono font-bold ${colorClasses[stat.color || 'default']}`}>
              {stat.value}
            </span>
            <span className="text-sm text-slate-500">{stat.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-slate-200 p-4 text-center"
        >
          <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold font-mono ${colorClasses[stat.color || 'default']}`}>
            {stat.value}
          </p>
          {stat.subValue && (
            <p className="text-xs text-slate-400 mt-1">{stat.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Helper to create stats from national/state summary */
export function createConditionStats(data: {
  total: number;
  good: number;
  fair: number;
  poor: number;
  goodPct: number;
  fairPct: number;
  poorPct: number;
  totalDailyCrossings?: number;
}): StatItem[] {
  return [
    {
      label: 'Total Bridges',
      value: formatNumber(data.total),
      color: 'blue',
    },
    {
      label: 'Good Condition',
      value: formatPct(data.goodPct),
      subValue: formatNumber(data.good) + ' bridges',
      color: 'green',
    },
    {
      label: 'Fair Condition',
      value: formatPct(data.fairPct),
      subValue: formatNumber(data.fair) + ' bridges',
      color: 'yellow',
    },
    {
      label: 'Poor Condition',
      value: formatPct(data.poorPct),
      subValue: formatNumber(data.poor) + ' bridges',
      color: 'red',
    },
    ...(data.totalDailyCrossings
      ? [
          {
            label: 'Daily Crossings',
            value: formatNumber(Math.round(data.totalDailyCrossings / 1000000)) + 'M',
            subValue: 'vehicles per day',
            color: 'default' as const,
          },
        ]
      : []),
  ];
}
