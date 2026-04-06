'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { formatNumber } from '@/lib/format';

interface AgeDistributionChartProps {
  distribution: Record<string, number>;
  height?: number;
}

// Age categories in order
const AGE_ORDER = ['0-20 years', '21-40 years', '41-60 years', '61-80 years', '80+ years'];

const AGE_COLORS: Record<string, string> = {
  '0-20 years': '#22c55e',   // green - newest
  '21-40 years': '#84cc16',  // lime
  '41-60 years': '#eab308',  // yellow
  '61-80 years': '#f97316',  // orange
  '80+ years': '#ef4444',    // red - oldest
};

export default function AgeDistributionChart({
  distribution,
  height = 300,
}: AgeDistributionChartProps) {
  // Convert to array and sort by predefined order
  const data = AGE_ORDER
    .filter((age) => distribution[age] !== undefined)
    .map((age) => ({
      age,
      count: distribution[age],
      shortLabel: age.replace(' years', ''),
    }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { age: string; count: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = ((item.count / total) * 100).toFixed(1);
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
          <p className="font-semibold text-slate-900">{item.age}</p>
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
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <XAxis
            dataKey="shortLabel"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            label={{
              value: 'Bridge Age',
              position: 'bottom',
              offset: 0,
              fill: '#64748b',
              fontSize: 12,
            }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.age} fill={AGE_COLORS[entry.age] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
