'use client';

/**
 * TrendSection component
 * Complete trend display section for bridge or aggregate pages
 */

import { BridgeTrendChart, AggregateTrendChart, PoorTrendChart } from './TrendChart';
import TrendBadge from './TrendBadge';
import type { BridgeTrendData, AggregateTrendData } from '@/types';
import { getTrendDescription, getAggregateTrendDescription, TREND_YEARS } from '@/lib/trends-utils';

// =============================================================================
// BRIDGE TREND SECTION (for individual bridge pages)
// =============================================================================

interface BridgeTrendSectionProps {
  data: BridgeTrendData;
}

export function BridgeTrendSection({ data }: BridgeTrendSectionProps) {
  const trendDescription = getTrendDescription(data.trend, data.ratingChange);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">5-Year Condition Trend</h2>
        <TrendBadge trend={data.trend} />
      </div>

      <p className="text-slate-600 mb-4">{trendDescription}</p>

      <BridgeTrendChart data={data} />

      {data.statusChanges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Status Changes</h3>
          <ul className="space-y-1">
            {data.statusChanges.map((change, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Data: {TREND_YEARS[0]}-{TREND_YEARS[TREND_YEARS.length - 1]} FHWA National Bridge Inventory
      </p>
    </section>
  );
}

// =============================================================================
// AGGREGATE TREND SECTION (for state/county pages)
// =============================================================================

interface AggregateTrendSectionProps {
  data: AggregateTrendData;
  title?: string;
  showStackedChart?: boolean;
}

export function AggregateTrendSection({
  data,
  title = '5-Year Bridge Condition Trends',
  showStackedChart = true,
}: AggregateTrendSectionProps) {
  const trendDescription = getAggregateTrendDescription(data);
  const latestYear = data.years[data.years.length - 1];
  const latestPoor = data.poorPct[data.poorPct.length - 1];
  const latestFair = data.fairPct[data.fairPct.length - 1];
  const latestGood = data.goodPct[data.goodPct.length - 1];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <TrendBadge trend={data.trend} />
      </div>

      <p className="text-slate-600 mb-4">{trendDescription}</p>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{latestGood}%</div>
          <div className="text-xs text-green-600">Good ({latestYear})</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-700">{latestFair}%</div>
          <div className="text-xs text-yellow-600">Fair ({latestYear})</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{latestPoor}%</div>
          <div className="text-xs text-red-600">Poor ({latestYear})</div>
        </div>
      </div>

      {showStackedChart ? (
        <AggregateTrendChart data={data} />
      ) : (
        <PoorTrendChart data={data} />
      )}

      {/* Year-over-year comparison */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Year-over-Year Changes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-1">Year</th>
                <th className="text-right py-1">Good</th>
                <th className="text-right py-1">Fair</th>
                <th className="text-right py-1">Poor</th>
              </tr>
            </thead>
            <tbody>
              {data.years.map((year, i) => (
                <tr key={year} className="border-t border-slate-100">
                  <td className="py-1 font-medium">{year}</td>
                  <td className="text-right text-green-600">{data.goodPct[i]}%</td>
                  <td className="text-right text-yellow-600">{data.fairPct[i]}%</td>
                  <td className="text-right text-red-600">{data.poorPct[i]}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Data: {TREND_YEARS[0]}-{TREND_YEARS[TREND_YEARS.length - 1]} FHWA National Bridge Inventory
      </p>
    </section>
  );
}

// =============================================================================
// COMPACT TREND DISPLAY (for lists/cards)
// =============================================================================

interface CompactTrendProps {
  trend: AggregateTrendData;
}

export function CompactTrendDisplay({ trend }: CompactTrendProps) {
  const change = trend.changeFromBaseline;
  const isImproving = change < 0;
  const isWorsening = change > 0;

  return (
    <div className="flex items-center gap-2">
      <TrendBadge trend={trend.trend} size="sm" showLabel={false} />
      <span className={`text-sm font-medium ${
        isImproving ? 'text-green-600' : isWorsening ? 'text-red-600' : 'text-slate-600'
      }`}>
        {isImproving && '↓'}{isWorsening && '↑'}{Math.abs(change).toFixed(1)}% poor since 2020
      </span>
    </div>
  );
}
