'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/format';
import ConditionBadge from './ConditionBadge';
import type { RankingBridge } from '@/types';

interface PaginatedRankingTableProps {
  rankingType: string;
  valueColumn: 'lengthFt' | 'yearBuilt' | 'adt' | 'lowestRating' | 'maxSpanFt';
  valueLabel: string;
  formatType?: 'number' | 'feet' | 'year' | 'rating';
  showDescription?: boolean;
  descriptionType?: 'oldest' | 'longest' | 'trafficked' | 'condition' | 'span' | 'historic';
  initialBridges?: RankingBridge[];
  initialTotal?: number;
}

const CURRENT_YEAR = 2026;
const PAGE_SIZE = 50;

function getBridgeDescription(bridge: RankingBridge, descriptionType?: string): string {
  const age = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : null;
  const location = bridge.location ? ` in ${bridge.location}` : '';
  const condition = bridge.conditionCategory ? ` Currently rated in ${bridge.conditionCategory.toLowerCase()} condition.` : '';

  switch (descriptionType) {
    case 'oldest':
      if (!bridge.yearBuilt) return 'Year built unknown.';
      if (bridge.yearBuilt < 1850) {
        return `This ${age}-year-old bridge${location} was built in ${bridge.yearBuilt} during the Early Republic era.${condition}`;
      } else if (bridge.yearBuilt < 1900) {
        return `Built in ${bridge.yearBuilt}${location}, this ${age}-year-old bridge dates to the Industrial Age.${condition}`;
      } else if (bridge.yearBuilt < 1920) {
        return `Constructed in ${bridge.yearBuilt}${location}, this ${age}-year-old structure is from the Progressive Era.${condition}`;
      } else {
        return `This ${age}-year-old bridge${location} was built in ${bridge.yearBuilt} during the early Auto Age.${condition}`;
      }
    case 'longest':
      return bridge.lengthFt
        ? `This bridge${location} spans ${formatNumber(bridge.lengthFt)} feet total${bridge.maxSpanFt ? ` with a ${formatNumber(bridge.maxSpanFt)}-foot main span` : ''}.${bridge.yearBuilt ? ` Built in ${bridge.yearBuilt}.` : ''}${condition}`
        : 'Length data unavailable.';
    case 'span':
      return bridge.maxSpanFt
        ? `Features a ${formatNumber(bridge.maxSpanFt)}-foot main span${location}${bridge.lengthFt ? `, part of a ${formatNumber(bridge.lengthFt)}-foot total structure` : ''}.${bridge.yearBuilt ? ` Built in ${bridge.yearBuilt}.` : ''}${condition}`
        : 'Span data unavailable.';
    case 'trafficked':
      return bridge.adt
        ? `This bridge${location} carries approximately ${formatNumber(bridge.adt)} vehicles per day.${bridge.yearBuilt ? ` Built in ${bridge.yearBuilt}.` : ''}${condition}`
        : 'Traffic data unavailable.';
    case 'condition':
      const labels: Record<number, string> = { 0: 'Failed', 1: 'Imminent Failure', 2: 'Critical', 3: 'Serious' };
      const label = bridge.lowestRating !== null ? labels[bridge.lowestRating] || 'Unknown' : 'Unknown';
      return `This bridge${location} is rated ${bridge.lowestRating} (${label}) on the federal condition scale.${bridge.yearBuilt ? ` Built in ${bridge.yearBuilt}.` : ''}${bridge.adt ? ` Carries ${formatNumber(bridge.adt)} vehicles daily.` : ''}`;
    case 'historic':
      const material = bridge.materialName || 'unknown material';
      const design = bridge.designTypeName || '';
      const historicAge = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : null;
      if (!bridge.yearBuilt) return `Listed on the National Register of Historic Places. Material: ${material}.${condition}`;
      return `This ${historicAge}-year-old ${material.toLowerCase()} bridge${location} was built in ${bridge.yearBuilt}${design ? ` using ${design.toLowerCase()} design` : ''}. Listed on the National Register of Historic Places.${condition}`;
    default:
      return '';
  }
}

export default function PaginatedRankingTable({
  rankingType,
  valueColumn,
  valueLabel,
  formatType = 'number',
  showDescription = false,
  descriptionType,
  initialBridges = [],
  initialTotal = 0,
}: PaginatedRankingTableProps) {
  const [bridges, setBridges] = useState<RankingBridge[]>(initialBridges);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBridges = useCallback(async (pageNum: number, searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: PAGE_SIZE.toString(),
      });
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      const res = await fetch(`/api/rankings/${rankingType}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setBridges(data.bridges);
      setTotal(data.total);
    } catch (e) {
      setError('Failed to load bridges. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [rankingType]);

  // Fetch when page or search changes
  useEffect(() => {
    fetchBridges(page, search);
  }, [page, search, fetchBridges]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const format = (val: number | null) => {
    if (val === null) return '—';
    switch (formatType) {
      case 'feet':
        return `${formatNumber(Math.round(val))} ft`;
      case 'year':
      case 'rating':
        return val.toString();
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by road name, crossing, location, or state..."
              className="w-full px-4 py-2.5 pl-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Search
          </button>
        </div>
        {search && (
          <p className="text-sm text-slate-500 mt-2">
            Found {formatNumber(total)} bridge{total !== 1 ? 's' : ''} matching &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* Loading / Error States */}
      {loading && (
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-slate-500">Loading bridges...</p>
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchBridges(page, search)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 text-left font-medium text-slate-600 w-16">Rank</th>
                  <th className="py-3 px-4 text-left font-medium text-slate-600">Bridge</th>
                  <th className="py-3 px-4 text-left font-medium text-slate-600">State</th>
                  <th className="py-3 px-4 text-right font-medium text-slate-600">{valueLabel}</th>
                  <th className="py-3 px-4 text-center font-medium text-slate-600">Condition</th>
                </tr>
              </thead>
              <tbody>
                {bridges.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      {search ? `No bridges found matching "${search}"` : 'No bridges found'}
                    </td>
                  </tr>
                )}
                {bridges.map((bridge, idx) => {
                  const rank = page * PAGE_SIZE + idx + 1;
                  const bridgeSlug = bridge.id;
                  const bridgeName = bridge.facilityCarried || 'Unknown Road';
                  const over = bridge.featuresIntersected || 'Unknown';

                  return (
                    <tr key={bridge.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500">#{rank}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/bridge/${bridge.state.toLowerCase()}/${bridgeSlug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {bridgeName}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">over {over}</p>
                        {showDescription && descriptionType && (
                          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{getBridgeDescription(bridge, descriptionType)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/state/${bridge.state.toLowerCase()}`}
                          className="text-slate-600 hover:text-blue-600"
                        >
                          {bridge.stateName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {format(bridge[valueColumn] as number | null)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ConditionBadge condition={bridge.conditionCategory} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              <p className="text-sm text-slate-500">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of{' '}
                {formatNumber(total)} bridges
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
