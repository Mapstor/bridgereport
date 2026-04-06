'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatNumber, formatPct } from '@/lib/format';
import { getPoorPctColorClass } from './ConditionBadge';
import type { RankingState } from '@/types';

type SortKey = 'stateName' | 'total' | 'poorPct' | 'fairPct' | 'goodPct' | 'avgYearBuilt' | 'avgAdt';
type SortDir = 'asc' | 'desc';

interface StateRankingTableProps {
  states: RankingState[];
  showDescription?: boolean;
}

// National averages for comparison
const NATIONAL_AVG = {
  poorPct: 7.5,
  fairPct: 43.0,
  goodPct: 49.5,
  avgYear: 1984,
  avgAdt: 5500,
};

// Regional climate/geography context
const STATE_CONTEXT: Record<string, string> = {
  AK: 'extreme cold and permafrost',
  AL: 'humid subtropical conditions',
  AR: 'river crossings and flooding',
  AZ: 'extreme desert heat',
  CA: 'seismic activity and wildfires',
  CO: 'high altitude and freeze-thaw cycles',
  CT: 'aging infrastructure and coastal weather',
  DC: 'heavy urban traffic',
  DE: 'coastal conditions',
  FL: 'hurricanes and coastal saltwater',
  GA: 'humid conditions and rapid growth',
  HI: 'tropical climate and salt air',
  IA: 'extensive rural road network',
  ID: 'mountainous terrain',
  IL: 'harsh winters and heavy freight',
  IN: 'freight corridors and freeze-thaw',
  KS: 'agricultural road network',
  KY: 'Appalachian terrain',
  LA: 'swamps, flooding, and hurricanes',
  MA: 'aging infrastructure and coastal weather',
  MD: 'Chesapeake Bay crossings',
  ME: 'harsh winters and rural terrain',
  MI: 'Great Lakes weather and salt use',
  MN: 'extreme cold and freeze-thaw',
  MO: 'river crossings and weather extremes',
  MS: 'flooding and humid conditions',
  MT: 'rural expanses and harsh winters',
  NC: 'coastal hurricanes and mountain terrain',
  ND: 'extreme cold and rural network',
  NE: 'agricultural crossings',
  NH: 'harsh winters and aging infrastructure',
  NJ: 'dense urban traffic and aging bridges',
  NM: 'desert conditions',
  NV: 'desert heat and rapid growth',
  NY: 'harsh winters and heavy traffic',
  OH: 'Great Lakes weather and freight corridors',
  OK: 'tornadoes and weather extremes',
  OR: 'seismic risk and wet climate',
  PA: 'aging infrastructure and harsh winters',
  PR: 'tropical storms and coastal conditions',
  RI: 'coastal conditions and aging bridges',
  SC: 'coastal hurricanes',
  SD: 'rural expanses and harsh winters',
  TN: 'river crossings',
  TX: 'extreme heat and rapid growth',
  UT: 'mountain terrain and rapid growth',
  VA: 'diverse terrain from coast to mountains',
  VI: 'tropical storms and limited resources',
  VT: 'harsh winters and rural terrain',
  WA: 'seismic risk and wet climate',
  WI: 'harsh winters and Great Lakes weather',
  WV: 'mountainous Appalachian terrain',
  WY: 'harsh winters and rural expanses',
};

function getStateDescription(state: RankingState, rank: number, totalStates: number): string {
  const {
    stateName,
    state: abbr,
    total,
    poorPct,
    fairPct,
    goodPct,
    avgYearBuilt,
    avgAdt,
  } = state;

  const sentences: string[] = [];

  // Sentence 1: Ranking and bridge count context
  const rankDesc = rank <= 5
    ? 'one of the worst'
    : rank <= 10
    ? 'among the bottom ten'
    : rank <= totalStates / 2
    ? 'below average'
    : rank >= totalStates - 5
    ? 'one of the best'
    : rank >= totalStates - 10
    ? 'among the top ten'
    : 'above average';

  const sizeDesc = total > 20000
    ? 'one of the largest bridge inventories in the nation'
    : total > 10000
    ? 'a substantial bridge network'
    : total > 5000
    ? 'a moderate-sized bridge inventory'
    : total > 1000
    ? 'a smaller bridge network'
    : 'a limited number of bridges';

  sentences.push(
    `${stateName} ranks #${rank} out of ${totalStates} states with ${formatPct(poorPct)} of its ${formatNumber(total)} bridges in poor condition, making it ${rankDesc} in the nation.`
  );

  // Sentence 2: Condition distribution analysis
  const poorCompare = poorPct > NATIONAL_AVG.poorPct + 5
    ? 'significantly above'
    : poorPct > NATIONAL_AVG.poorPct
    ? 'above'
    : poorPct < NATIONAL_AVG.poorPct - 3
    ? 'well below'
    : 'near';

  const goodCompare = goodPct > NATIONAL_AVG.goodPct + 10
    ? 'significantly exceeds'
    : goodPct > NATIONAL_AVG.goodPct
    ? 'exceeds'
    : goodPct < NATIONAL_AVG.goodPct - 10
    ? 'falls well below'
    : 'is near';

  sentences.push(
    `The state's poor bridge rate is ${poorCompare} the national average of ${formatPct(NATIONAL_AVG.poorPct)}, while its ${formatPct(goodPct)} good-condition rate ${goodCompare} the ${formatPct(NATIONAL_AVG.goodPct)} national benchmark.`
  );

  // Sentence 3: Age and traffic context
  const ageDesc = avgYearBuilt < 1975
    ? 'an aging fleet averaging over 50 years old'
    : avgYearBuilt < 1985
    ? 'infrastructure averaging around 40 years old'
    : avgYearBuilt > 1995
    ? 'relatively newer bridges'
    : 'bridges of moderate age';

  const trafficDesc = avgAdt > 10000
    ? 'high traffic volumes'
    : avgAdt > 5000
    ? 'moderate traffic levels'
    : avgAdt > 2000
    ? 'lower traffic volumes typical of rural areas'
    : 'very low traffic counts reflecting rural character';

  sentences.push(
    `With ${ageDesc} (avg. built ${avgYearBuilt}) and ${trafficDesc} (${formatNumber(avgAdt)} avg. daily vehicles), the state faces ${poorPct > 10 ? 'significant' : poorPct > 7 ? 'moderate' : 'manageable'} infrastructure challenges.`
  );

  // Sentence 4: Regional context
  const context = STATE_CONTEXT[abbr];
  if (context) {
    sentences.push(
      `Regional factors including ${context} contribute to the state's bridge maintenance needs.`
    );
  }

  return sentences.join(' ');
}

export default function StateRankingTable({ states, showDescription = true }: StateRankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('poorPct');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sortedStates = useMemo(() => {
    return [...states].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Handle string comparison
      if (sortKey === 'stateName') {
        const comparison = (aVal as string).localeCompare(bVal as string);
        return sortDir === 'asc' ? comparison : -comparison;
      }

      // Handle numeric comparison
      const numA = aVal as number;
      const numB = bVal as number;
      return sortDir === 'asc' ? numA - numB : numB - numA;
    });
  }, [states, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      // Default to descending for numbers, ascending for names
      setSortDir(key === 'stateName' ? 'asc' : 'desc');
    }
  };

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-slate-900 transition-colors group"
    >
      {label}
      <span className={`transition-colors ${sortKey === column ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
        {sortKey === column ? (
          sortDir === 'asc' ? '↑' : '↓'
        ) : (
          '↕'
        )}
      </span>
    </button>
  );

  return (
    <div>
      {/* Sort controls when descriptions are shown */}
      {showDescription && (
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-200">
          <span className="text-sm text-slate-500">Sort by:</span>
          <button
            onClick={() => handleSort('poorPct')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              sortKey === 'poorPct'
                ? 'bg-red-100 text-red-700 font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Poor % {sortKey === 'poorPct' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('goodPct')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              sortKey === 'goodPct'
                ? 'bg-green-100 text-green-700 font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Good % {sortKey === 'goodPct' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('total')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              sortKey === 'total'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Total {sortKey === 'total' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('avgYearBuilt')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              sortKey === 'avgYearBuilt'
                ? 'bg-amber-100 text-amber-700 font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Age {sortKey === 'avgYearBuilt' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('stateName')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              sortKey === 'stateName'
                ? 'bg-slate-200 text-slate-700 font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Name {sortKey === 'stateName' && (sortDir === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                #
              </th>
              {showDescription ? (
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider" colSpan={7}>
                  State Details & Analysis
                </th>
              ) : (
              <>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <SortButton column="stateName" label="State" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  <SortButton column="total" label="Bridges" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  <SortButton column="poorPct" label="Poor %" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  <SortButton column="fairPct" label="Fair %" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  <SortButton column="goodPct" label="Good %" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  <SortButton column="avgYearBuilt" label="Avg Year" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  <SortButton column="avgAdt" label="Avg ADT" />
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedStates.map((state, index) => {
            const poorColorClass = getPoorPctColorClass(state.poorPct);
            const description = showDescription
              ? getStateDescription(state, index + 1, sortedStates.length)
              : null;

            return (
              <tr
                key={state.state}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-mono text-slate-400 align-top">
                  {index + 1}
                </td>
                <td className="px-4 py-3" colSpan={showDescription ? 7 : 1}>
                  {showDescription ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <Link
                          href={`/state/${state.state.toLowerCase()}`}
                          className="group flex items-center gap-2"
                        >
                          <span className="text-xs font-mono text-slate-400 w-6">
                            {state.state}
                          </span>
                          <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                            {state.stateName}
                          </span>
                        </Link>
                        <span className="text-sm font-mono text-slate-700">
                          {formatNumber(state.total)} bridges
                        </span>
                        <span className={`text-sm font-mono font-semibold ${poorColorClass}`}>
                          {formatPct(state.poorPct)} poor
                        </span>
                        <span className="text-sm font-mono text-yellow-600">
                          {formatPct(state.fairPct)} fair
                        </span>
                        <span className="text-sm font-mono text-green-600">
                          {formatPct(state.goodPct)} good
                        </span>
                        <span className="text-sm font-mono text-slate-500">
                          Avg. {state.avgYearBuilt}
                        </span>
                        <span className="text-sm font-mono text-slate-500">
                          {formatNumber(state.avgAdt)} ADT
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  ) : (
                    <Link
                      href={`/state/${state.state.toLowerCase()}`}
                      className="group flex items-center gap-2"
                    >
                      <span className="text-xs font-mono text-slate-400 w-6">
                        {state.state}
                      </span>
                      <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {state.stateName}
                      </span>
                    </Link>
                  )}
                </td>
                {!showDescription && (
                  <>
                    <td className="px-4 py-3 text-sm font-mono text-slate-700 text-right">
                      {formatNumber(state.total)}
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono text-right font-semibold ${poorColorClass}`}>
                      {formatPct(state.poorPct)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-yellow-600 text-right">
                      {formatPct(state.fairPct)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-green-600 text-right">
                      {formatPct(state.goodPct)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600 text-right">
                      {state.avgYearBuilt}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600 text-right">
                      {formatNumber(state.avgAdt)}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  );
}
