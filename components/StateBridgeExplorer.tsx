'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the map component with no SSR
const StateBridgeMap = dynamic(() => import('./StateBridgeMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-100 flex items-center justify-center rounded-lg">
      <p className="text-slate-400">Loading map...</p>
    </div>
  ),
});

interface BridgePoint {
  id: string;
  state: string;
  lat: number;
  lon: number;
  facilityCarried: string;
  featuresIntersected: string;
  condition: 'good' | 'fair' | 'poor' | null;
}

interface StateBridgesResponse {
  state: string;
  bounds: {
    south: number;
    north: number;
    west: number;
    east: number;
  };
  stats: {
    total: number;
    good: number;
    fair: number;
    poor: number;
  };
  bridges: BridgePoint[];
}

interface StateBridgeExplorerProps {
  stateAbbr: string;
  stateName: string;
}

function ConditionBadge({ condition }: { condition: 'good' | 'fair' | 'poor' | null }) {
  const classes = {
    good: 'bg-green-100 text-green-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800',
    null: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes[condition || 'null']}`}>
      {condition || 'N/A'}
    </span>
  );
}

export default function StateBridgeExplorer({ stateAbbr, stateName }: StateBridgeExplorerProps) {
  const [data, setData] = useState<StateBridgesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'good' | 'fair' | 'poor'>('all');
  const [page, setPage] = useState(1);
  const [selectedBridge, setSelectedBridge] = useState<string | null>(null);

  const PAGE_SIZE = 25;

  // Fetch bridges data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/bridges/state/${stateAbbr}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load bridges');
        setLoading(false);
      });
  }, [stateAbbr]);

  // Filter bridges
  const filteredBridges = useMemo(() => {
    if (!data) return [];

    let bridges = data.bridges;

    // Apply condition filter
    if (conditionFilter !== 'all') {
      bridges = bridges.filter(b => b.condition === conditionFilter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      bridges = bridges.filter(b =>
        b.facilityCarried.toLowerCase().includes(searchLower) ||
        b.featuresIntersected.toLowerCase().includes(searchLower) ||
        b.id.toLowerCase().includes(searchLower)
      );
    }

    return bridges;
  }, [data, search, conditionFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, conditionFilter]);

  // Paginated bridges for table
  const paginatedBridges = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredBridges.slice(start, start + PAGE_SIZE);
  }, [filteredBridges, page]);

  const totalPages = Math.ceil(filteredBridges.length / PAGE_SIZE);

  const handleSelectBridge = useCallback((id: string | null) => {
    setSelectedBridge(id);
    if (id) {
      // Find the bridge and scroll to it in the table
      const index = filteredBridges.findIndex(b => b.id === id);
      if (index !== -1) {
        const newPage = Math.floor(index / PAGE_SIZE) + 1;
        setPage(newPage);
      }
    }
  }, [filteredBridges]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-4" />
          <div className="h-[400px] bg-slate-100 rounded-lg mb-4" />
          <div className="h-10 w-full bg-slate-100 rounded mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-red-600">{error || 'Failed to load data'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-800">
            Explore All {data.stats.total.toLocaleString()} Bridges
          </h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              {data.stats.good.toLocaleString()} Good
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              {data.stats.fair.toLocaleString()} Fair
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              {data.stats.poor.toLocaleString()} Poor
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <StateBridgeMap
          bridges={filteredBridges.length <= 5000 ? filteredBridges : filteredBridges.slice(0, 5000)}
          bounds={data.bounds}
          selectedBridge={selectedBridge}
          onSelectBridge={handleSelectBridge}
          stateAbbr={stateAbbr}
        />
        {filteredBridges.length > 5000 && (
          <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            Showing 5,000 of {filteredBridges.length.toLocaleString()} bridges on map
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-3 border-t border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by road name, feature crossed, or bridge ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as typeof conditionFilter)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Conditions</option>
              <option value="poor">Poor Only</option>
              <option value="fair">Fair Only</option>
              <option value="good">Good Only</option>
            </select>
          </div>
        </div>
        {(search || conditionFilter !== 'all') && (
          <div className="mt-2 text-sm text-slate-600">
            Showing {filteredBridges.length.toLocaleString()} of {data.stats.total.toLocaleString()} bridges
            {search && <span> matching &quot;{search}&quot;</span>}
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Bridge ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Road/Facility</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Crosses</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase">Condition</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedBridges.map((bridge) => (
              <tr
                key={bridge.id}
                className={`hover:bg-slate-50 cursor-pointer ${selectedBridge === bridge.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleSelectBridge(bridge.id)}
              >
                <td className="px-4 py-2 font-mono text-xs text-slate-600">{bridge.id}</td>
                <td className="px-4 py-2 font-medium">{bridge.facilityCarried || '—'}</td>
                <td className="px-4 py-2 text-slate-600">{bridge.featuresIntersected || '—'}</td>
                <td className="px-4 py-2 text-center">
                  <ConditionBadge condition={bridge.condition} />
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/bridge/${stateAbbr.toLowerCase()}/${bridge.id}`}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Details →
                  </Link>
                </td>
              </tr>
            ))}
            {paginatedBridges.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No bridges found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {page} of {totalPages} ({filteredBridges.length.toLocaleString()} bridges)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
