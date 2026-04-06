'use client';

import { useState, useMemo } from 'react';

interface CountyData {
  fips: string;
  name: string;
  total: number;
  good: number;
  fair: number;
  poor: number;
  poorPct: number;
  avgAdt: number;
}

interface SortableCountyTableProps {
  counties: CountyData[];
  stateAbbr: string;
  showDescriptions?: boolean;
  stateName?: string;
  stateAvgPoorPct?: number;
}

function generateCountyDescription(
  county: CountyData,
  allCounties: CountyData[],
  stateName: string,
  stateAvgPoorPct: number
): string {
  const parts: string[] = [];

  // Rank by total bridges
  const totalRank = [...allCounties].sort((a, b) => b.total - a.total).findIndex(c => c.fips === county.fips) + 1;
  if (totalRank === 1) {
    parts.push(`Largest bridge inventory in ${stateName}.`);
  } else if (totalRank <= 3) {
    parts.push(`One of ${stateName}'s largest bridge inventories.`);
  }

  // Condition relative to state average
  if (county.poorPct > stateAvgPoorPct * 1.5 && county.poorPct > 5) {
    parts.push(`Poor condition rate significantly above state average.`);
  } else if (county.poorPct < stateAvgPoorPct * 0.5 && county.poor === 0) {
    parts.push(`No bridges in poor condition.`);
  } else if (county.poorPct < stateAvgPoorPct * 0.5) {
    parts.push(`Below-average deficiency rate.`);
  }

  // Traffic context
  if (county.avgAdt > 20000) {
    parts.push(`High-traffic area averaging ${county.avgAdt.toLocaleString()} vehicles per bridge daily.`);
  } else if (county.avgAdt < 500 && county.total > 20) {
    parts.push(`Primarily rural road network.`);
  }

  return parts.join(' ');
}

function ConditionBar({ good, fair, poor, total }: { good: number; fair: number; poor: number; total: number }) {
  const gw = (good / total) * 100;
  const fw = (fair / total) * 100;
  const pw = (poor / total) * 100;

  return (
    <div className="flex rounded overflow-hidden h-5 w-full min-w-[100px]">
      <div
        className="bg-green-500 flex items-center justify-center text-white text-[10px] font-bold"
        style={{ width: `${gw}%` }}
      >
        {gw > 15 && good.toLocaleString()}
      </div>
      <div
        className="bg-yellow-500 flex items-center justify-center text-white text-[10px] font-bold"
        style={{ width: `${fw}%` }}
      >
        {fw > 15 && fair.toLocaleString()}
      </div>
      <div
        className="bg-red-500 flex items-center justify-center text-white text-[10px] font-bold"
        style={{ width: `${pw}%`, minWidth: pw > 0 ? '20px' : '0' }}
      >
        {pw > 5 && poor}
      </div>
    </div>
  );
}

type SortKey = 'name' | 'total' | 'poor' | 'poorPct' | 'avgAdt';

export default function SortableCountyTable({
  counties,
  stateAbbr,
  showDescriptions = false,
  stateName = '',
  stateAvgPoorPct = 0,
}: SortableCountyTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDesc, setSortDesc] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const sortedCounties = useMemo(() => {
    const sorted = [...counties].sort((a, b) => {
      if (sortKey === 'name') {
        return sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDesc ? bv - av : av - bv;
    });
    return showAll ? sorted : sorted.slice(0, 10);
  }, [counties, sortKey, sortDesc, showAll]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const sortArrow = (key: SortKey) => (sortKey === key ? (sortDesc ? ' ↓' : ' ↑') : '');

  const thClass = "px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none";
  const thClassRight = "px-3 py-2 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none";

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200">
              <th className={thClass} onClick={() => toggleSort('name')}>
                County{sortArrow('name')}
              </th>
              <th className={thClassRight} onClick={() => toggleSort('total')}>
                Bridges{sortArrow('total')}
              </th>
              <th className="px-2 py-2 text-center text-[11px] font-semibold text-slate-500 uppercase">
                Condition
              </th>
              <th className={thClassRight} onClick={() => toggleSort('poor')}>
                Poor{sortArrow('poor')}
              </th>
              <th className={thClassRight} onClick={() => toggleSort('poorPct')}>
                Poor %{sortArrow('poorPct')}
              </th>
              <th className={thClassRight} onClick={() => toggleSort('avgAdt')}>
                Avg ADT{sortArrow('avgAdt')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedCounties.map((county) => {
              const poorColorClass =
                county.poorPct > 10
                  ? 'text-red-600'
                  : county.poorPct > 5
                  ? 'text-orange-600'
                  : county.poorPct > 2
                  ? 'text-yellow-600'
                  : 'text-green-600';

              const description = showDescriptions
                ? generateCountyDescription(county, counties, stateName, stateAvgPoorPct)
                : '';

              return (
                <tr key={county.fips} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-900">{county.name}</span>
                    {description && (
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-tight max-w-xs">{description}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{county.total.toLocaleString()}</td>
                  <td className="px-2 py-2">
                    <ConditionBar good={county.good} fair={county.fair} poor={county.poor} total={county.total} />
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono font-bold ${
                      county.poor > 0 ? 'text-red-600' : 'text-slate-400'
                    }`}
                  >
                    {county.poor}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-semibold ${poorColorClass}`}>
                    {county.poorPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-600 text-xs">
                    {county.avgAdt.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!showAll && counties.length > 10 && (
        <div className="text-center py-2 border-t border-slate-100">
          <button
            onClick={() => setShowAll(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Show all {counties.length} counties →
          </button>
        </div>
      )}
    </div>
  );
}
