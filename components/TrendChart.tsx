'use client';

/**
 * TrendChart component
 * Visualizes multi-year bridge condition trends using Recharts
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import type { BridgeTrendData, AggregateTrendData } from '@/types';

// =============================================================================
// BRIDGE TREND CHART (Individual bridge rating over time)
// =============================================================================

interface BridgeTrendChartProps {
  data: BridgeTrendData;
  height?: number;
}

export function BridgeTrendChart({ data, height = 200 }: BridgeTrendChartProps) {
  const chartData = data.snapshots.map((s) => ({
    year: s.year,
    rating: s.lowestRating,
    condition: s.conditionCategory,
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            domain={[0, 9]}
            ticks={[0, 3, 5, 7, 9]}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
            label={{ value: 'Rating', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-slate-900">{data.year}</p>
                    <p className="text-sm text-slate-600">
                      Rating: <span className="font-medium">{data.rating}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Condition: <span className="font-medium capitalize">{data.condition}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* Reference lines for condition thresholds */}
          <ReferenceLine y={7} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Good', fill: '#22c55e', fontSize: 10 }} />
          <ReferenceLine y={5} stroke="#eab308" strokeDasharray="5 5" label={{ value: 'Fair', fill: '#eab308', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// =============================================================================
// AGGREGATE TREND CHART (State/County condition distribution over time)
// =============================================================================

interface AggregateTrendChartProps {
  data: AggregateTrendData;
  height?: number;
  showLegend?: boolean;
}

export function AggregateTrendChart({ data, height = 250, showLegend = true }: AggregateTrendChartProps) {
  const chartData = data.years.map((year, i) => ({
    year,
    good: data.goodPct[i],
    fair: data.fairPct[i],
    poor: data.poorPct[i],
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
            label={{ value: '% of Bridges', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-slate-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-medium">{entry.value}%</span>
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="good"
            name="Good"
            stackId="1"
            stroke="#22c55e"
            fill="#bbf7d0"
          />
          <Area
            type="monotone"
            dataKey="fair"
            name="Fair"
            stackId="1"
            stroke="#eab308"
            fill="#fef08a"
          />
          <Area
            type="monotone"
            dataKey="poor"
            name="Poor"
            stackId="1"
            stroke="#ef4444"
            fill="#fecaca"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// =============================================================================
// POOR BRIDGES TREND LINE (Simple line showing % poor over time)
// =============================================================================

interface PoorTrendChartProps {
  data: AggregateTrendData;
  height?: number;
}

export function PoorTrendChart({ data, height = 180 }: PoorTrendChartProps) {
  const chartData = data.years.map((year, i) => ({
    year,
    poor: data.poorPct[i],
  }));

  const minPoor = Math.min(...data.poorPct);
  const maxPoor = Math.max(...data.poorPct);
  const yMin = Math.floor(Math.max(0, minPoor - 2));
  const yMax = Math.ceil(maxPoor + 2);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
            label={{ value: '% Poor', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Poor Bridges']}
            labelFormatter={(label) => `Year: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="poor"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#dc2626' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
