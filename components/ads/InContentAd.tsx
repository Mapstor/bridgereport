'use client';

import { useAds } from './AdProvider';
import { getAdContainerClasses, type AdPlacement } from '@/lib/ads';

interface InContentAdProps {
  placement?: AdPlacement;
  className?: string;
}

/**
 * In-content ad unit for placement between content sections
 * Raptive will automatically fill these with appropriate ads
 */
export default function InContentAd({
  placement = 'in-content-1',
  className = '',
}: InContentAdProps) {
  const { showAdsOnPage, adsEnabled } = useAds();

  // Don't render anything if ads are disabled
  if (!adsEnabled || !showAdsOnPage) {
    return null;
  }

  const containerClasses = getAdContainerClasses(placement);

  return (
    <div
      className={`${containerClasses} ${className}`}
      data-ad-placement={placement}
    >
      {/* Raptive auto-detects and fills this container */}
      <div
        className="adthrive-ad"
        data-ad-unit={placement}
        style={{ minHeight: '90px', width: '100%', maxWidth: '728px' }}
      >
        {/* Placeholder shown while ad loads */}
        <div className="bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs h-[90px]">
          <span className="sr-only">Advertisement</span>
        </div>
      </div>
    </div>
  );
}
