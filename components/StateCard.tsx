import Link from 'next/link';
import { formatNumber, formatPct } from '@/lib/data';
import { getPoorPctColorClass } from './ConditionBadge';

interface StateCardProps {
  state: string;
  stateName: string;
  total: number;
  poorPct: number;
}

export default function StateCard({ state, stateName, total, poorPct }: StateCardProps) {
  const colorClass = getPoorPctColorClass(poorPct);

  return (
    <Link
      href={`/state/${state.toLowerCase()}`}
      className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {stateName}
        </h3>
        <span className="text-xs text-slate-400 font-mono">{state}</span>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-slate-500">Bridges</p>
          <p className="text-lg font-mono font-bold text-slate-900">
            {formatNumber(total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Poor</p>
          <p className={`text-lg font-mono font-bold ${colorClass}`}>
            {formatPct(poorPct)}
          </p>
        </div>
      </div>
    </Link>
  );
}

interface StateGridProps {
  states: Array<{
    state: string;
    stateName: string;
    total: number;
    poorPct: number;
  }>;
}

export function StateGrid({ states }: StateGridProps) {
  // Sort by total bridges descending by default
  const sortedStates = [...states].sort((a, b) => b.total - a.total);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {sortedStates.map((state) => (
        <StateCard
          key={state.state}
          state={state.state}
          stateName={state.stateName}
          total={state.total}
          poorPct={state.poorPct}
        />
      ))}
    </div>
  );
}
