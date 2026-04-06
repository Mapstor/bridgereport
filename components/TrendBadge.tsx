/**
 * TrendBadge component
 * Shows a visual indicator of bridge condition trend direction
 */

import type { TrendDirection } from '@/types';

interface TrendBadgeProps {
  trend: TrendDirection;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TREND_CONFIG: Record<TrendDirection, { icon: string; label: string; color: string; bgColor: string }> = {
  improving: {
    icon: '↑',
    label: 'Improving',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  declining: {
    icon: '↓',
    label: 'Declining',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  stable: {
    icon: '→',
    label: 'Stable',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
  },
  unknown: {
    icon: '?',
    label: 'Unknown',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

export default function TrendBadge({ trend, size = 'md', showLabel = true }: TrendBadgeProps) {
  const config = TREND_CONFIG[trend];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.color} ${sizeClass}`}
      title={`5-year trend: ${config.label}`}
    >
      <span className="font-bold">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

/**
 * Inline trend arrow for compact displays
 */
export function TrendArrow({ trend, className = '' }: { trend: TrendDirection; className?: string }) {
  const config = TREND_CONFIG[trend];

  return (
    <span className={`${config.color} ${className}`} title={`Trend: ${config.label}`}>
      {config.icon}
    </span>
  );
}
