interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

function getRatingColor(rating: number): string {
  if (rating >= 7) return '#16a34a'; // green-600
  if (rating >= 5) return '#ca8a04'; // yellow-600
  return '#dc2626'; // red-600
}

function getRatingBgColor(rating: number): string {
  if (rating >= 7) return '#f0fdf4'; // green-50
  if (rating >= 5) return '#fefce8'; // yellow-50
  return '#fef2f2'; // red-50
}

function getRatingBorderColor(rating: number): string {
  if (rating >= 7) return '#bbf7d0'; // green-200
  if (rating >= 5) return '#fef08a'; // yellow-200
  return '#fecaca'; // red-200
}

export default function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-11 h-11 text-xl',
  };

  return (
    <div
      className={`${sizes[size]} rounded-md inline-flex items-center justify-center font-mono font-extrabold border-2`}
      style={{
        backgroundColor: getRatingBgColor(rating),
        borderColor: getRatingBorderColor(rating),
        color: getRatingColor(rating),
      }}
    >
      {rating}
    </div>
  );
}
