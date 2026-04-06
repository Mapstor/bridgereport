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
}

// Convert condition to numeric value for sorting (poor = 1, fair = 2, good = 3)
function conditionToNumber(condition: ConditionCategory | null): number {
  if (condition === 'poor') return 1;
  if (condition === 'fair') return 2;
  if (condition === 'good') return 3;
  return 0; // null/unknown
}

export default function CountyBridgeTable({
  bridges,
  state,
  defaultSort = 'condition',
}: CountyBridgeTableProps) {
  const [sortField, setSortField] = useState<SortField>(defaultSort);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
          {sortedBridges.map((bridge) => (
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
      <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
        Showing {bridges.length} bridges. Click column headers to sort.
      </div>
    </div>
  );
}
