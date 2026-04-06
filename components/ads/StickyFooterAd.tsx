'use client';

import { useState } from 'react';
import { useAds } from './AdProvider';
import { getAdContainerClasses, ADS_CONFIG } from '@/lib/ads';

interface StickyFooterAdProps {
  className?: string;
}

/**
 * Sticky footer ad for mobile devices
 * Includes a dismiss button for better UX
 */
export default function StickyFooterAd({ className = '' }: StickyFooterAdProps) {
  const { showAdsOnPage, adsEnabled } = useAds();
  const [dismissed, setDismissed] = useState(false);

  // Don't render if ads disabled, sticky footer disabled, or user dismissed
  if (!adsEnabled || !showAdsOnPage || !ADS_CONFIG.density.showStickyFooter || dismissed) {
    return null;
  }

  const containerClasses = getAdContainerClasses('sticky-footer');

  return (
    <div
      className={`${containerClasses} ${className} lg:hidden`}
      data-ad-placement="sticky-footer"
    >
      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute -top-8 right-2 bg-white border border-slate-200 rounded-t px-2 py-1 text-xs text-slate-500 hover:text-slate-700 shadow-sm"
        aria-label="Close advertisement"
      >
        Close
      </button>

      <div
        className="adthrive-ad"
        data-ad-unit="sticky-footer"
        style={{
          width: '100%',
          maxWidth: `${ADS_CONFIG.units.stickyFooter.width}px`,
          minHeight: `${ADS_CONFIG.units.stickyFooter.height}px`,
        }}
      >
        {/* Placeholder */}
        <div
          className="bg-slate-100 flex items-center justify-center text-slate-400 text-xs"
          style={{ height: `${ADS_CONFIG.units.stickyFooter.height}px` }}
        >
          <span className="sr-only">Advertisement</span>
        </div>
      </div>
    </div>
  );
}
