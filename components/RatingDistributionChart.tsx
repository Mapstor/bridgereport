'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { formatNumber } from '@/lib/format';

interface RatingDistributionChartProps {
  distribution: Record<string, number>;
  height?: number;
}

const RATING_COLORS: Record<string, string> = {
  '0': '#ef4444', // red-500 (poor)
  '1': '#ef4444',
  '2': '#ef4444',
  '3': '#f97316', // orange-500
  '4': '#f97316',
  '5': '#eab308', // yellow-500 (fair)
  '6': '#eab308',
  '7': '#22c55e', // green-500 (good)
  '8': '#22c55e',
  '9': '#16a34a', // green-600
};

export default function RatingDistributionChart({
  distribution,
  height = 300,
}: RatingDistributionChartProps) {
  // Convert to array and sort by rating
  const data = Object.entries(distribution)
    .map(([rating, count]) => ({
      rating,
      count,
      label: getRatingLabel(rating),
    }))
    .sort((a, b) => Number(a.rating) - Number(b.rating));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { rating: string; count: number; label: string } }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
          <p className="font-semibold text-slate-900">
            Rating {item.rating}: {item.label}
          </p>
          <p className="text-sm text-slate-600">
            {formatNumber(item.count)} bridges
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
            dataKey="rating"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={{ stroke: '#e2e8f0' }}
            label={{
              value: 'Condition Rating',
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
              <Cell key={entry.rating} fill={RATING_COLORS[entry.rating] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function getRatingLabel(rating: string): string {
  const labels: Record<string, string> = {
    '0': 'Failed',
    '1': 'Imminent Failure',
    '2': 'Critical',
    '3': 'Serious',
    '4': 'Poor',
    '5': 'Fair',
    '6': 'Satisfactory',
    '7': 'Good',
    '8': 'Very Good',
    '9': 'Excellent',
  };
  return labels[rating] || 'Unknown';
}
