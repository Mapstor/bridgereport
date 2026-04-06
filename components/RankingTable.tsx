'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/format';
import ConditionBadge from './ConditionBadge';
import type { RankingBridge } from '@/types';

interface RankingTableProps {
  bridges: RankingBridge[];
  valueColumn: 'lengthFt' | 'yearBuilt' | 'adt' | 'lowestRating' | 'maxSpanFt';
  valueLabel: string;
  formatType?: 'number' | 'feet' | 'year' | 'rating';
  sortAscending?: boolean;
  showDescription?: boolean;
  descriptionType?: 'oldest' | 'longest' | 'trafficked' | 'condition' | 'span' | 'historic';
}

// Generate a brief description based on bridge data and ranking type
// Use a fixed year to avoid hydration mismatch between server and client
const CURRENT_YEAR = 2026;

function getBridgeDescription(bridge: RankingBridge, descriptionType?: string): string {
  const age = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : null;
  const location = bridge.location ? ` in ${bridge.location}` : '';
  const condition = bridge.conditionCategory ? ` Currently rated in ${bridge.conditionCategory.toLowerCase()} condition.` : '';

  switch (descriptionType) {
    case 'oldest':
      if (!bridge.yearBuilt) return 'Year built unknown.';
      if (bridge.yearBuilt < 1850) {
        return `This ${age}-year-old bridge${location} was built in ${bridge.yearBuilt} during the Early Republic era, likely featuring stone arch or wooden covered construction.${condition}`;
      } else if (bridge.yearBuilt < 1900) {
        return `Built in ${bridge.yearBuilt}${location}, this ${age}-year-old bridge dates to the Industrial Age when cast iron and early steel construction dominated American infrastructure.${condition}`;
      } else if (bridge.yearBuilt < 1920) {
        return `Constructed in ${bridge.yearBuilt}${location}, this ${age}-year-old structure is from the Progressive Era when reinforced concrete was introduced.${condition}`;
      } else {
        return `This ${age}-year-old bridge${location} was built in ${bridge.yearBuilt} during the early Auto Age of wider roadways and highway expansion.${condition}`;
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

const PAGE_SIZE = 50;

export default function RankingTable({
  bridges,
  valueColumn,
  valueLabel,
  formatType = 'number',
  sortAscending = false,
  showDescription = false,
  descriptionType,
}: RankingTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const filteredBridges = useMemo(() => {
    if (!search.trim()) return bridges;
    const q = search.toLowerCase();
    return bridges.filter(b =>
      (b.facilityCarried?.toLowerCase().includes(q)) ||
      (b.featuresIntersected?.toLowerCase().includes(q)) ||
      (b.location?.toLowerCase().includes(q)) ||
      (b.stateName?.toLowerCase().includes(q)) ||
      (b.state?.toLowerCase() === q)
    );
  }, [bridges, search]);

  const sortedBridges = useMemo(() => {
    return [...filteredBridges].sort((a, b) => {
      const aVal = a[valueColumn] ?? (sortAscending ? Infinity : -Infinity);
      const bVal = b[valueColumn] ?? (sortAscending ? Infinity : -Infinity);
      return sortAscending ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filteredBridges, valueColumn, sortAscending]);

  const totalPages = Math.ceil(sortedBridges.length / PAGE_SIZE);
  const paginatedBridges = sortedBridges.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

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
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
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
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {search && (
          <p className="text-sm text-slate-500 mt-2">
            Found {formatNumber(sortedBridges.length)} bridge{sortedBridges.length !== 1 ? 's' : ''} matching &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

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
            {paginatedBridges.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No bridges found matching &ldquo;{search}&rdquo;
                </td>
              </tr>
            )}
            {paginatedBridges.map((bridge, idx) => {
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
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedBridges.length)} of{' '}
            {formatNumber(sortedBridges.length)} {search ? 'matching ' : ''}bridges
            {search && bridges.length !== sortedBridges.length && ` (${formatNumber(bridges.length)} total)`}
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
    </div>
  );
}
