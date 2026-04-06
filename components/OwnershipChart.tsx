'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { formatNumber } from '@/lib/format';

interface OwnershipChartProps {
  owners: Record<string, number>;
  height?: number;
  maxItems?: number;
}

const OWNER_COLORS: Record<string, string> = {
  'State Highway Agency': '#3b82f6',      // blue
  'County Highway Agency': '#8b5cf6',     // purple
  'City/Municipal': '#06b6d4',            // cyan
  'Town/Township': '#14b8a6',             // teal
  'Federal Highway Administration': '#dc2626', // red
  'Other Federal': '#ef4444',
  'National Park Service': '#16a34a',     // green
  'U.S. Forest Service': '#22c55e',
  'Corps of Engineers': '#0891b2',
  'Bureau of Indian Affairs': '#ca8a04',
  'Bureau of Land Management': '#84cc16',
  'Fish and Wildlife': '#65a30d',
  'State Toll Authority': '#f59e0b',      // amber
  'Local Toll Authority': '#fbbf24',
  'Railroad': '#6b7280',
  'Private': '#374151',
  'Other State': '#64748b',
  'Other Local': '#94a3b8',
  'State Park/Forest': '#4ade80',
  'Local Park/Forest': '#86efac',
  'Unknown': '#d1d5db',
  'Other': '#9ca3af',
};

export default function OwnershipChart({
  owners,
  height = 300,
  maxItems = 8,
}: OwnershipChartProps) {
  // Convert to array, sort by count descending, and take top items
  const sortedOwners = Object.entries(owners)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Group remaining into "Other" if more than maxItems
  let data = sortedOwners;
  if (sortedOwners.length > maxItems) {
    const topItems = sortedOwners.slice(0, maxItems - 1);
    const otherCount = sortedOwners
      .slice(maxItems - 1)
      .reduce((sum, item) => sum + item.count, 0);
    data = [...topItems, { name: 'Other', count: otherCount }];
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Truncate long names for display
  const truncateName = (name: string, maxLen: number = 20): string => {
    if (name.length <= maxLen) return name;
    return name.slice(0, maxLen - 1) + '…';
  };

  const displayData = data.map((item) => ({
    ...item,
    displayName: truncateName(item.name),
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { name: string; count: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = ((item.count / total) * 100).toFixed(1);
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="text-sm text-slate-600">
            {formatNumber(item.count)} bridges ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
        >
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {displayData.map((entry) => (
              <Cell
                key={entry.name}
                fill={OWNER_COLORS[entry.name] || '#94a3b8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
