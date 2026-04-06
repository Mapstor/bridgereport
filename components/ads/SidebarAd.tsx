'use client';

import { useAds } from './AdProvider';
import { getAdContainerClasses, ADS_CONFIG, type AdPlacement } from '@/lib/ads';

interface SidebarAdProps {
  placement?: AdPlacement;
  sticky?: boolean;
  className?: string;
}

/**
 * Sidebar ad unit for desktop layouts
 * Can be sticky to follow scroll
 */
export default function SidebarAd({
  placement = 'sidebar-top',
  sticky = false,
  className = '',
}: SidebarAdProps) {
  const { showAdsOnPage, adsEnabled } = useAds();

  // Don't render if ads disabled or sidebar ads turned off
  if (!adsEnabled || !showAdsOnPage || !ADS_CONFIG.density.showSidebarAds) {
    return null;
  }

  const actualPlacement = sticky ? 'sidebar-sticky' : placement;
  const containerClasses = getAdContainerClasses(actualPlacement);

  return (
    <div
      className={`${containerClasses} ${className} hidden lg:flex`}
      data-ad-placement={actualPlacement}
    >
      <div
        className="adthrive-ad"
        data-ad-unit={actualPlacement}
        style={{
          width: `${ADS_CONFIG.units.sidebar.width}px`,
          minHeight: `${ADS_CONFIG.units.sidebar.height}px`,
        }}
      >
        {/* Placeholder */}
        <div
          className="bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs"
          style={{
            width: `${ADS_CONFIG.units.sidebar.width}px`,
            height: `${ADS_CONFIG.units.sidebar.height}px`,
          }}
        >
          <span className="sr-only">Advertisement</span>
        </div>
      </div>
    </div>
  );
}
