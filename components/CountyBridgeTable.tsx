'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ConditionBadge from './ConditionBadge';
import { formatNumber } from '@/lib/format';
import type { BridgeSlim, ConditionCategory } from '@/types';

type SortField = 'condition' | 'yearBuilt' | 'adt' | 'lengthFt' | 'material';
type SortDirection = 'asc' | 'desc';

interface CountyBridgeTableProps {
  bridges: BridgeSlim[];
  state: string;
  defaultSort?: SortField;
  /** Cap initial server-rendered rows to keep HTML payload manageable on large cities
   * (Houston has 2,427 bridges → 3MB HTML uncapped). Users can expand client-side. */
  initialDisplayCount?: number;
  /** When provided alongside `totalCount > bridges.length`, the "Show all" button
   * fetches /api/cities/{state}/{slug}/bridges instead of relying on client-side
   * data already shipped. This means the initial RSC payload only ships the visible
   * 100 bridges, dramatically reducing transfer size for big cities. */
  slug?: string;
  totalCount?: number;
}

// Convert condition to numeric value for sorting (poor = 1, fair = 2, good = 3)
function conditionToNumber(condition: ConditionCategory | null): number {
  if (condition === 'poor') return 1;
  if (condition === 'fair') return 2;
  if (condition === 'good') return 3;
  return 0; // null/unknown
}

export default function CountyBridgeTable({
  bridges: initialBridges,
  state,
  defaultSort = 'condition',
  initialDisplayCount = 100,
  slug,
  totalCount,
}: CountyBridgeTableProps) {
  const [sortField, setSortField] = useState<SortField>(defaultSort);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [allBridges, setAllBridges] = useState<BridgeSlim[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Effective bridges in scope for sort/render. After lazy-fetch, replaces initial.
  const bridges = allBridges ?? initialBridges;
  // True total available — may be > initialBridges.length when caller did the slice.
  const knownTotal = totalCount ?? bridges.length;

  async function handleShowAll() {
    if (loading) return;
    // If we have everything client-side already, just expand display.
    if (!slug || initialBridges.length >= knownTotal) {
      setAllBridges(initialBridges);
      return;
    }
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/cities/${state.toLowerCase()}/${slug}/bridges`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { bridges: BridgeSlim[] };
      setAllBridges(data.bridges);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }

  const sortedBridges = useMemo(() => {
    return [...bridges].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'condition':
          comparison = conditionToNumber(a.conditionCategory) - conditionToNumber(b.conditionCategory);
          break;
        case 'yearBuilt':
          comparison = (a.yearBuilt ?? 9999) - (b.yearBuilt ?? 9999);
          break;
        case 'adt':
          comparison = (a.adt ?? 0) - (b.adt ?? 0);
          break;
        case 'lengthFt':
          comparison = (a.lengthFt ?? 0) - (b.lengthFt ?? 0);
          break;
        case 'material':
          comparison = (a.materialName ?? '').localeCompare(b.materialName ?? '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [bridges, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with appropriate default direction
      setSortField(field);
      // Condition: worst first (asc), ADT/Length: highest first (desc), Year: oldest first (asc)
      setSortDirection(field === 'adt' || field === 'lengthFt' ? 'desc' : 'asc');
    }
  };

  const SortHeader = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none ${
          align === 'right' ? 'text-right' : 'text-left'
        } ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
        onClick={() => handleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {isActive && (
            <span className="text-blue-600">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </span>
      </th>
    );
  };

  if (bridges.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No bridges found in this county.
      </div>
    );
  }

  // If lazy-fetch loaded everything, show the full sorted set. Otherwise show the
  // initial slice the caller passed (already capped to ~100 server-side).
  const fullyLoaded = allBridges !== null;
  const visibleBridges = fullyLoaded ? sortedBridges : sortedBridges.slice(0, initialDisplayCount);
  const hiddenCount = knownTotal - visibleBridges.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bridge
            </th>
            <SortHeader field="condition" label="Condition" />
            <SortHeader field="yearBuilt" label="Year" />
            <SortHeader field="material" label="Material" />
            <SortHeader field="lengthFt" label="Length" align="right" />
            <SortHeader field="adt" label="ADT" align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleBridges.map((bridge) => (
            <tr key={bridge.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/bridge/${state.toLowerCase()}/${bridge.id}`}
                  className="group"
                >
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    {bridge.facilityCarried || 'Unknown Road'}
                  </p>
                  <p className="text-xs text-slate-500">
                    over {bridge.featuresIntersected || 'Unknown'}
                  </p>
                  {bridge.location && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {bridge.location}
                    </p>
                  )}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <ConditionBadge condition={bridge.conditionCategory} size="sm" />
                  {bridge.lowestRating !== null && (
                    <span className="text-xs text-slate-400 font-mono">
                      ({bridge.lowestRating})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-mono text-slate-600">
                {bridge.yearBuilt || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {bridge.materialName || '—'}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-slate-600 text-right">
                {bridge.lengthFt ? `${formatNumber(Math.round(bridge.lengthFt))} ft` : '—'}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-slate-600 text-right">
                {bridge.adt ? formatNumber(bridge.adt) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {hiddenCount > 0 ? (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-slate-500">
            Showing {formatNumber(visibleBridges.length)} of {formatNumber(knownTotal)} bridges
            {fetchError && (
              <span className="ml-2 text-red-600">· Failed to load — retry?</span>
            )}
          </span>
          <button
            type="button"
            onClick={handleShowAll}
            disabled={loading}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:text-slate-400 disabled:cursor-wait"
          >
            {loading ? 'Loading…' : `Show all ${formatNumber(knownTotal)} →`}
          </button>
        </div>
      ) : (
        <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
          Showing {formatNumber(knownTotal)} bridges. Click column headers to sort.
        </div>
      )}
    </div>
  );
}
