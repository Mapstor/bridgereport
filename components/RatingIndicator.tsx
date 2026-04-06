/**
 * RatingIndicator - Displays NBI condition ratings (0-9) with color coding
 * 0-4: Poor (red), 5-6: Fair (yellow), 7-9: Good (green)
 */

interface RatingIndicatorProps {
  rating: string | number | null;
  label: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getRatingColor(rating: number | null): {
  bg: string;
  text: string;
  border: string;
} {
  if (rating === null) {
    return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' };
  }
  if (rating <= 4) {
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
  }
  if (rating <= 6) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
  }
  return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
}

function getRatingDescription(rating: number | null): string {
  if (rating === null) return 'N/A';
  if (rating === 9) return 'Excellent';
  if (rating === 8) return 'Very Good';
  if (rating === 7) return 'Good';
  if (rating === 6) return 'Satisfactory';
  if (rating === 5) return 'Fair';
  if (rating === 4) return 'Poor';
  if (rating === 3) return 'Serious';
  if (rating === 2) return 'Critical';
  if (rating === 1) return 'Imminent Failure';
  if (rating === 0) return 'Failed';
  return 'Unknown';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export default function RatingIndicator({
  rating,
  label,
  showLabel = true,
  size = 'md',
}: RatingIndicatorProps) {
  const numericRating = rating === null ? null : typeof rating === 'string' ? parseInt(rating, 10) : rating;
  const displayRating = numericRating !== null && !isNaN(numericRating) ? numericRating : null;
  const colors = getRatingColor(displayRating);
  const description = getRatingDescription(displayRating);

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border} border-2 rounded-lg flex items-center justify-center font-bold font-mono`}
      >
        {displayRating !== null ? displayRating : '—'}
      </div>
      {showLabel && (
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      )}
    </div>
  );
}

/** Standalone function to get rating color class */
export function getRatingColorClass(rating: number | null): string {
  if (rating === null) return 'text-slate-500';
  if (rating <= 4) return 'text-red-600';
  if (rating <= 6) return 'text-yellow-600';
  return 'text-green-600';
}

/** Get the background color class for a rating */
export function getRatingBgClass(rating: number | null): string {
  if (rating === null) return 'bg-slate-100';
  if (rating <= 4) return 'bg-red-100';
  if (rating <= 6) return 'bg-yellow-100';
  return 'bg-green-100';
}
