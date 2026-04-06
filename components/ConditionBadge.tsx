import { ConditionCategory } from '@/types';

interface ConditionBadgeProps {
  condition: ConditionCategory | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const conditionConfig = {
  good: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Good',
  },
  fair: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Fair',
  },
  poor: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Poor',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function ConditionBadge({
  condition,
  size = 'md',
  showLabel = true,
}: ConditionBadgeProps) {
  if (!condition) {
    return (
      <span
        className={`inline-flex items-center rounded-full border bg-slate-100 text-slate-600 border-slate-200 font-medium ${sizeClasses[size]}`}
      >
        {showLabel ? 'Unknown' : '—'}
      </span>
    );
  }

  const config = conditionConfig[condition];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showLabel ? config.label : condition.charAt(0).toUpperCase()}
    </span>
  );
}

/** Get the color class for a poorPct value */
export function getPoorPctColorClass(poorPct: number): string {
  if (poorPct < 5) return 'text-green-600';
  if (poorPct <= 10) return 'text-yellow-600';
  return 'text-red-600';
}

/** Get background color class for a poorPct value */
export function getPoorPctBgClass(poorPct: number): string {
  if (poorPct < 5) return 'bg-green-50';
  if (poorPct <= 10) return 'bg-yellow-50';
  return 'bg-red-50';
}
