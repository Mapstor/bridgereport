'use client';

import { useState } from 'react';

interface ExpandableSectionProps {
  visibleCount: number;
  totalCount: number;
  children: React.ReactNode;
  label?: string;
}

export default function ExpandableSection({
  visibleCount,
  totalCount,
  children,
  label = 'bridges',
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = totalCount - visibleCount;
  const needsExpansion = hiddenCount > 0;

  return (
    <div>
      <div className={!expanded && needsExpansion ? 'worst-bridges-collapsed' : undefined}>
        {children}
      </div>
      {needsExpansion && !expanded && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Show all {totalCount} {label}
            <span className="text-blue-200 text-sm">({hiddenCount} more)</span>
          </button>
        </div>
      )}
      <style>{`
        .worst-bridges-collapsed tbody tr:nth-child(n+${visibleCount + 1}) {
          display: none;
        }
      `}</style>
    </div>
  );
}
