import Link from 'next/link';
import ConditionBadge from './ConditionBadge';
import { formatNumber } from '@/lib/data';
import type { RankingBridge } from '@/types';

interface BridgeTableProps {
  bridges: RankingBridge[];
  showRank?: boolean;
  showState?: boolean;
  compact?: boolean;
}

export default function BridgeTable({
  bridges,
  showRank = false,
  showState = true,
  compact = false,
}: BridgeTableProps) {
  if (compact) {
    return (
      <div className="space-y-3">
        {bridges.map((bridge, index) => (
          <Link
            key={bridge.id}
            href={`/bridge/${bridge.state.toLowerCase()}/${bridge.id}`}
            className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                {showRank && (
                  <span className="text-sm text-slate-400 font-mono mr-2">
                    #{index + 1}
                  </span>
                )}
                <p className="font-medium text-slate-900 truncate">
                  {bridge.facilityCarried || 'Unknown Road'}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  over {bridge.featuresIntersected || 'Unknown'}
                </p>
                {showState && (
                  <p className="text-xs text-slate-400 mt-1">
                    {bridge.stateName}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <ConditionBadge condition={bridge.conditionCategory} size="sm" />
                {bridge.yearBuilt && (
                  <span className="text-xs text-slate-400">
                    Built {bridge.yearBuilt}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200">
            {showRank && (
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                #
              </th>
            )}
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bridge
            </th>
            {showState && (
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                State
              </th>
            )}
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Year
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Condition
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
              ADT
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bridges.map((bridge, index) => (
            <tr key={bridge.id} className="hover:bg-slate-50 transition-colors">
              {showRank && (
                <td className="px-4 py-3 text-sm font-mono text-slate-400">
                  {index + 1}
                </td>
              )}
              <td className="px-4 py-3">
                <Link
                  href={`/bridge/${bridge.state.toLowerCase()}/${bridge.id}`}
                  className="group"
                >
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {bridge.facilityCarried || 'Unknown Road'}
                  </p>
                  <p className="text-xs text-slate-500">
                    over {bridge.featuresIntersected || 'Unknown'}
                  </p>
                </Link>
              </td>
              {showState && (
                <td className="px-4 py-3 text-sm text-slate-600">
                  <Link
                    href={`/state/${bridge.state.toLowerCase()}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {bridge.stateName}
                  </Link>
                </td>
              )}
              <td className="px-4 py-3 text-sm font-mono text-slate-600">
                {bridge.yearBuilt || '—'}
              </td>
              <td className="px-4 py-3">
                <ConditionBadge condition={bridge.conditionCategory} size="sm" />
              </td>
              <td className="px-4 py-3 text-sm font-mono text-slate-600 text-right">
                {bridge.adt ? formatNumber(bridge.adt) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
