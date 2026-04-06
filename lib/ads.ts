/**
 * Ad Configuration and Utilities
 * Raptive (formerly AdThrive) integration
 *
 * NOTE: Ads are disabled by default. Set NEXT_PUBLIC_ADS_ENABLED=true
 * in environment variables to enable ads once traffic qualifies.
 */

// Ad configuration
export const ADS_CONFIG = {
  // Master switch - set via environment variable
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',

  // Raptive site ID (set this once approved)
  raptiveSiteId: process.env.NEXT_PUBLIC_RAPTIVE_SITE_ID || '',

  // Ad density settings (ads per page section)
  density: {
    // Minimum content height (px) before showing an in-content ad
    minContentHeight: 800,
    // Minimum paragraphs between in-content ads
    minParagraphsBetweenAds: 4,
    // Show sidebar ads on desktop
    showSidebarAds: true,
    // Show sticky footer on mobile
    showStickyFooter: true,
  },

  // Pages where ads should NOT appear
  excludedPaths: [
    '/widgets',
    '/embed',
  ],

  // Ad unit sizes (Raptive will auto-optimize, but these are hints)
  units: {
    inContent: {
      desktop: { width: 728, height: 90 },
      mobile: { width: 320, height: 100 },
    },
    sidebar: {
      width: 300,
      height: 250,
    },
    stickyFooter: {
      width: 320,
      height: 50,
    },
  },
};

/**
 * Check if ads should be shown on a given path
 */
export function shouldShowAds(pathname: string): boolean {
  if (!ADS_CONFIG.enabled) return false;

  // Check excluded paths
  for (const excluded of ADS_CONFIG.excludedPaths) {
    if (pathname.startsWith(excluded)) return false;
  }

  return true;
}

/**
 * Get Raptive script URL
 * Raptive provides a site-specific script URL after approval
 */
export function getRaptiveScriptUrl(): string | null {
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.raptiveSiteId) return null;
  return `https://ads.adthrive.com/sites/${ADS_CONFIG.raptiveSiteId}/ads.min.js`;
}

/**
 * Ad placement types
 */
export type AdPlacement =
  | 'in-content-1'
  | 'in-content-2'
  | 'in-content-3'
  | 'sidebar-top'
  | 'sidebar-sticky'
  | 'sticky-footer'
  | 'above-fold'
  | 'below-fold';

/**
 * Get CSS classes for ad container based on placement
 */
export function getAdContainerClasses(placement: AdPlacement): string {
  const baseClasses = 'ad-container flex items-center justify-center';

  switch (placement) {
    case 'in-content-1':
    case 'in-content-2':
    case 'in-content-3':
      return `${baseClasses} my-8 mx-auto max-w-3xl`;
    case 'sidebar-top':
      return `${baseClasses} mb-6`;
    case 'sidebar-sticky':
      return `${baseClasses} sticky top-4`;
    case 'sticky-footer':
      return `${baseClasses} fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-slate-200`;
    case 'above-fold':
      return `${baseClasses} mt-4 mb-8`;
    case 'below-fold':
      return `${baseClasses} my-8`;
    default:
      return baseClasses;
  }
}
