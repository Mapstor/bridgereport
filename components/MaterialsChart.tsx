'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { formatNumber } from '@/lib/format';

interface MaterialsChartProps {
  materials: Record<string, number>;
  height?: number;
  maxItems?: number;
}

const MATERIAL_COLORS: Record<string, string> = {
  'Concrete': '#64748b',
  'Prestressed Concrete': '#475569',
  'Steel': '#3b82f6',
  'Steel Continuous': '#2563eb',
  'Wood/Timber': '#a16207',
  'Masonry': '#dc2626',
  'Aluminum/Wrought Iron': '#6b7280',
  'Other': '#94a3b8',
  'Metal (Other)': '#71717a',
};

export default function MaterialsChart({
  materials,
  height = 300,
  maxItems = 7,
}: MaterialsChartProps) {
  // Convert to array, sort by count descending, and take top items
  const sortedMaterials = Object.entries(materials)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Group remaining into "Other" if more than maxItems
  let data = sortedMaterials;
  if (sortedMaterials.length > maxItems) {
    const topItems = sortedMaterials.slice(0, maxItems - 1);
    const otherCount = sortedMaterials
      .slice(maxItems - 1)
      .reduce((sum, item) => sum + item.count, 0);
    data = [...topItems, { name: 'Other', count: otherCount }];
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

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
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
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
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={MATERIAL_COLORS[entry.name] || '#94a3b8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
